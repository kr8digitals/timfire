import {createHmac,timingSafeEqual,randomBytes} from 'node:crypto';import bcrypt from 'bcryptjs';import {cookies} from 'next/headers';
import {sendTemplated} from './email';
const NAME='timfire_admin';
/** The browser remembers you: five days, and every visit starts the five days
 *  again. Five days of silence and the session ends by itself. */
const TTL=5*24*60*60*1000;
const LOCK=15*60*1000;
/** How long a failed sign-in stays on the count before it is forgotten. */
const WINDOW=15*60*1000;
const CODE_TTL=10*60*1000;
type Attempt={count:number;until:number};const attempts:Map<string,Attempt>=(globalThis as typeof globalThis & {__tfAttempts?:Map<string,Attempt>}).__tfAttempts||new Map();(globalThis as typeof globalThis & {__tfAttempts?:Map<string,Attempt>}).__tfAttempts=attempts;
type PendingCode={code:string;expires:number;tries:number};
const codes:Map<string,PendingCode>=(globalThis as typeof globalThis & {__tfCodes?:Map<string,PendingCode>}).__tfCodes||new Map();(globalThis as typeof globalThis & {__tfCodes?:Map<string,PendingCode>}).__tfCodes=codes;
const codeRequests:Map<string,Attempt>=(globalThis as typeof globalThis & {__tfCodeRequests?:Map<string,Attempt>}).__tfCodeRequests||new Map();(globalThis as typeof globalThis & {__tfCodeRequests?:Map<string,Attempt>}).__tfCodeRequests=codeRequests;
function credentials(){
  const email=process.env.ADMIN_EMAIL,raw=process.env.ADMIN_PASSWORD_HASH;
  if(!email||!raw)return null;
  // Next's env parser treats `$` as a variable reference and truncates bcrypt
  // hashes pasted into .env files, so the supported format is the base64 of the
  // hash (no `$` characters to expand). A raw `$2…` value is accepted too, for
  // hosts that inject the variable without expansion.
  let hash=raw;
  try{const decoded=Buffer.from(raw,'base64').toString('utf8');if(decoded.startsWith('$2'))hash=decoded}catch{/* keep raw */}
  if(!hash.startsWith('$2'))return null;
  return {email,hash};
}
function sign(payload:string,secret:string){return createHmac('sha256',secret).update(payload).digest('base64url')}
/** Windowed counter: allows `max` events per `window` ms, then locks the key out
 *  for another full window. Used for code requests, so a genuine resend a minute
 *  later is welcome while a hammering script is not. */
function limited(map:Map<string,Attempt>,key:string,max=3,window=LOCK):boolean{const now=Date.now();const prev=map.get(key);if(!prev||prev.until<=now){map.set(key,{count:1,until:now+window});return false}prev.count+=1;if(prev.count>max){prev.until=now+window;return true}return false}
async function issueCookie(){const config=credentials();if(!config)return null;const exp=Date.now()+TTL;const payload=Buffer.from(JSON.stringify({exp,nonce:randomBytes(16).toString('hex')})).toString('base64url');const token=payload+'.'+sign(payload,config.hash);(await cookies()).set(NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:TTL/1000});return exp}
/** Step one: the password. On success a six-digit code is emailed through
 *  Resend, proving the mailbox belongs to the owner. No cookie yet. */
export async function login(email:string,password:string,key:string){const config=credentials();if(!config)return {ok:false,code:503,message:'Login is not configured.'};const now=Date.now(),prev=attempts.get(key),live=!!prev&&prev.until>now;if(live&&prev!.count>=5)return {ok:false,code:429,message:'Too many attempts. Try again in a few minutes.'};const equalEmail=email.trim().toLowerCase()===config.email.trim().toLowerCase();let ok=false;try{ok=await bcrypt.compare(password,config.hash)}catch{return {ok:false,code:503,message:'Login is not configured.'}}if(!equalEmail||!ok){/* Failures only count inside a fifteen-minute window, so one honest typo today and another next month never add up to a lockout. A burst does. */const count=(live?prev!.count:0)+1;attempts.set(key,{count,until:now+(count>=5?LOCK:WINDOW)});return {ok:false,code:count>=5?429:401,message:count>=5?'Too many attempts. Try again in a few minutes.':'Email or password is incorrect.'}}attempts.delete(key);
 if(limited(codeRequests,'req:'+key))return {ok:false,code:429,message:'Too many codes requested. Try again later.'};
 const code=String(Math.floor(100000+Math.random()*900000));codes.set(config.email,{code,expires:now+CODE_TTL,tries:0});
 const sent=await sendTemplated('admin_code',config.email,{code});
 if(!sent)return {ok:false,code:503,message:'The password is right, but the verification code could not be emailed. Try again in a moment.'};
 return {ok:true,code:200,message:'Verification code sent.',step:'code' as const};}
/** Step two: the emailed code. On success the five-day remembering cookie is set. */
export async function verify(email:string,code:string){const config=credentials();if(!config)return {ok:false,code:503,message:'Login is not configured.'};if(email.trim().toLowerCase()!==config.email.trim().toLowerCase())return {ok:false,code:401,message:'Email or password is incorrect.'};const pending=codes.get(config.email);const now=Date.now();if(!pending||pending.expires<now){codes.delete(config.email);return {ok:false,code:401,message:'That code has expired. Request a new one.'};}if(pending.tries>=3){codes.delete(config.email);return {ok:false,code:401,message:'Too many wrong codes. Request a new one.'};}if(pending.code!==code.trim()){pending.tries+=1;return {ok:false,code:401,message:'That code is not right. Check the email again.'};}codes.delete(config.email);const exp=await issueCookie();return exp?{ok:true,code:200,message:'Signed in.',expires:exp}:{ok:false,code:503,message:'Login is not configured.'};}
export async function session(){const config=credentials();const raw=(await cookies()).get(NAME)?.value;if(!config||!raw)return null;const [payload,sig]=raw.split('.');if(!payload||!sig)return null;const expected=sign(payload,config.hash);const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const v=JSON.parse(Buffer.from(payload,'base64url').toString());if(!(v.exp>Date.now()))return null;
 // Sliding window: any authenticated activity remembers the browser for
 // another five days from now.
 const exp=await issueCookie();return {expires:exp??v.exp};}catch{return null}}
export async function logout(){(await cookies()).delete(NAME)}
