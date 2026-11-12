import {createHmac,timingSafeEqual,randomBytes} from 'node:crypto';import bcrypt from 'bcryptjs';import {cookies} from 'next/headers';
const NAME='timfire_admin';const TTL=30*60*1000;const LOCK=15*60*1000;
type Attempt={count:number;until:number};const attempts:Map<string,Attempt>=(globalThis as typeof globalThis & {__tfAttempts?:Map<string,Attempt>}).__tfAttempts||new Map();(globalThis as typeof globalThis & {__tfAttempts?:Map<string,Attempt>}).__tfAttempts=attempts;
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
export async function login(email:string,password:string,key:string){const config=credentials();if(!config)return {ok:false,code:503,message:'Login is not configured.'};const now=Date.now(),prev=attempts.get(key);if(prev&&prev.until>now)return {ok:false,code:429,message:'Too many attempts. Try again later.'};const equalEmail=email.trim().toLowerCase()===config.email.trim().toLowerCase();let ok=false;try{ok=await bcrypt.compare(password,config.hash)}catch{return {ok:false,code:503,message:'Login is not configured.'}}if(!equalEmail||!ok){const count=(prev&&prev.until===0?prev.count:0)+1;attempts.set(key,{count,until:count>=5?now+LOCK:0});return {ok:false,code:count>=5?429:401,message:count>=5?'Too many attempts. Try again later.':'Email or password is incorrect.'}}attempts.delete(key);const exp=now+TTL;const payload=Buffer.from(JSON.stringify({exp,nonce:randomBytes(16).toString('hex')})).toString('base64url');const token=payload+'.'+sign(payload,config.hash);(await cookies()).set(NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:TTL/1000});return {ok:true,code:200,message:'Signed in.',expires:exp}}
export async function session(){const config=credentials();const raw=(await cookies()).get(NAME)?.value;if(!config||!raw)return null;const [payload,sig]=raw.split('.');if(!payload||!sig)return null;const expected=sign(payload,config.hash);const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const v=JSON.parse(Buffer.from(payload,'base64url').toString());return v.exp>Date.now()?{expires:v.exp}:null}catch{return null}}
export async function logout(){(await cookies()).delete(NAME)}
