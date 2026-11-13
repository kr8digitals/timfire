import {createHmac,timingSafeEqual,randomBytes,createHash} from 'node:crypto';import bcrypt from 'bcryptjs';import {cookies} from 'next/headers';
import {sendTemplated} from './email';
import {db} from './db';

const NAME='timfire_admin';
/** The browser remembers you: five days, and every visit starts the five days
 *  again. Five days of silence and the session ends by itself. */
const TTL=5*24*60*60*1000;
/** How long a failed sign-in or a code request stays on the count. */
const WINDOW=15*60*1000;
const LOCK=15*60*1000;
const CODE_TTL=10*60*1000;
const MAX_PASSWORD_TRIES=5;
const MAX_CODE_REQUESTS=3;
const MAX_CODE_TRIES=3;

/**
 * Sign-in state cannot live in process memory: a serverless function is many
 * short-lived instances, so the code emailed by one is invisible to the next
 * and the counters reset whenever an instance is recycled. Everything lives in
 * the `admin_signins` table instead, with this map kept as a same-instance fast
 * path and as the fallback if the database is unreachable.
 */
type State={email?:string;codeHash?:string;tries:number;tally:number;expiresAt:number};
type Row={key:string;email:string|null;code_hash:string|null;tries:number;tally:number;expires_at:string};
const mem:Map<string,State>=((globalThis as typeof globalThis & {__tfAuth?:Map<string,State>}).__tfAuth)||new Map();
(globalThis as typeof globalThis & {__tfAuth?:Map<string,State>}).__tfAuth=mem;
const sha256=(value:string)=>createHash('sha256').update(value).digest('hex');
function sameSecret(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}

/** 'db' for the rate-limit windows (global truth), 'memory' for the pending code
 *  (the instance that emailed it answers fastest). */
async function loadState(key:string,prefer:'db'|'memory'):Promise<State|null>{
  const now=Date.now();
  const fromMemory=()=>{const m=mem.get(key);if(m&&m.expiresAt>now)return m;if(m)mem.delete(key);return null};
  const fromDb=async ():Promise<State|null>=>{
    const supa=db();if(!supa)return null;
    const {data,error}=await supa.from('admin_signins').select('*').eq('key',key).maybeSingle();
    if(error){console.error('[auth] could not read the sign-in state:',error.message);return null}
    if(!data)return null;
    const row=data as Row;const expiresAt=new Date(row.expires_at).getTime();
    if(!(expiresAt>now)){await supa.from('admin_signins').delete().eq('key',key);return null}
    return {email:row.email??undefined,codeHash:row.code_hash??undefined,tries:row.tries,tally:row.tally,expiresAt};
  };
  if(prefer==='memory')return fromMemory()??await fromDb();
  return await fromDb()??fromMemory();
}
async function saveState(key:string,state:State){
  mem.set(key,state);
  const supa=db();if(!supa)return;
  const {error}=await supa.from('admin_signins').upsert({key,email:state.email??null,code_hash:state.codeHash??null,tries:state.tries,tally:state.tally,expires_at:new Date(state.expiresAt).toISOString(),updated_at:new Date().toISOString()},{onConflict:'key'});
  if(error)console.error('[auth] could not store the sign-in state:',error.message);
}
async function clearState(key:string){
  mem.delete(key);
  const supa=db();if(!supa)return;
  const {error}=await supa.from('admin_signins').delete().eq('key',key);
  if(error)console.error('[auth] could not clear the sign-in state:',error.message);
}

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
async function issueCookie(){const config=credentials();if(!config)return null;const exp=Date.now()+TTL;const payload=Buffer.from(JSON.stringify({exp,nonce:randomBytes(16).toString('hex')})).toString('base64url');const token=payload+'.'+sign(payload,config.hash);(await cookies()).set(NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:TTL/1000});return exp}

/** Step one: the password. On success a six-digit code is emailed through
 *  Resend, proving the mailbox belongs to the owner. No cookie yet. */
export async function login(email:string,password:string,key:string){
  const config=credentials();
  if(!config)return {ok:false,code:503,message:'Login is not configured.'};
  const now=Date.now();
  const pwKey='pw:'+key;
  const pw=await loadState(pwKey,'db');
  if(pw&&pw.tally>=MAX_PASSWORD_TRIES)return {ok:false,code:429,message:'Too many attempts. Try again in a few minutes.'};
  const isOwnerEmail=email.trim().toLowerCase()===config.email.trim().toLowerCase();
  let passwordOk=false;
  try{passwordOk=await bcrypt.compare(password,config.hash)}catch{return {ok:false,code:503,message:'Login is not configured.'}}
  if(!isOwnerEmail||!passwordOk){
    const tally=(pw?pw.tally:0)+1;
    await saveState(pwKey,{tries:0,tally,expiresAt:now+(tally>=MAX_PASSWORD_TRIES?LOCK:WINDOW)});
    if(tally>=MAX_PASSWORD_TRIES)return {ok:false,code:429,message:'Too many attempts. Try again in a few minutes.'};
    // Naming the address only after the password checked out: the owner who
    // typed the right password at the wrong mailbox is told where to go, and
    // anyone without the password learns nothing at all.
    if(passwordOk)return {ok:false,code:401,message:'Right password, wrong address — this dashboard signs in as '+config.email+'.'};
    return {ok:false,code:401,message:'Email or password is incorrect.'};
  }
  await clearState(pwKey);
  const reqKey='req:'+key;
  const requested=await loadState(reqKey,'db');
  if(requested&&requested.tally>=MAX_CODE_REQUESTS)return {ok:false,code:429,message:'Too many codes requested. Try again in a few minutes.'};
  await saveState(reqKey,{tries:0,tally:(requested?requested.tally:0)+1,expiresAt:now+WINDOW});
  const code=String(Math.floor(100000+Math.random()*900000));
  // Only the hash of the code is stored, so a database leak cannot sign anyone in.
  await saveState('code',{email:config.email,codeHash:sha256(code),tries:0,tally:0,expiresAt:now+CODE_TTL});
  const sent=await sendTemplated('admin_code',config.email,{code});
  if(!sent)return {ok:false,code:503,message:'The password is right, but the verification code could not be emailed. Try again in a moment.'};
  return {ok:true,code:200,message:'Verification code sent.',step:'code' as const,sentTo:config.email};
}

/** Step two: the emailed code. On success the five-day remembering cookie is set. */
export async function verify(email:string,code:string){
  const config=credentials();
  if(!config)return {ok:false,code:503,message:'Login is not configured.'};
  if(email.trim().toLowerCase()!==config.email.trim().toLowerCase())return {ok:false,code:401,message:'Email or password is incorrect.'};
  const pending=await loadState('code','memory');
  const now=Date.now();
  if(!pending||!pending.codeHash||pending.expiresAt<now){await clearState('code');return {ok:false,code:401,message:'That code has expired. Request a new one.'};}
  if(pending.tries>=MAX_CODE_TRIES){await clearState('code');return {ok:false,code:401,message:'Too many wrong codes. Request a new one.'};}
  if(!sameSecret(pending.codeHash,sha256(code.trim()))){
    await saveState('code',{...pending,tries:pending.tries+1});
    return {ok:false,code:401,message:'That code is not right. Check the email again.'};
  }
  await clearState('code');
  const exp=await issueCookie();
  return exp?{ok:true,code:200,message:'Signed in.',expires:exp}:{ok:false,code:503,message:'Login is not configured.'};
}

/** Signing out has to mean something: a signed cookie stays cryptographically
 *  valid until it expires, so the nonce inside it is written to the shared
 *  revocation list (the same table, expiring when the cookie would have) and
 *  checked on every authenticated request. If the database is unreachable the
 *  session is honoured rather than locking the owner out during an outage. */
async function revoked(nonce:string):Promise<boolean>{const state=await loadState('revoked:'+nonce,'db');return !!state}
async function revoke(raw:string){try{const [payload]=raw.split('.');if(!payload)return;const v=JSON.parse(Buffer.from(payload,'base64url').toString());if(!v.nonce)return;await saveState('revoked:'+String(v.nonce),{tries:0,tally:0,expiresAt:Number(v.exp)>Date.now()?Number(v.exp):Date.now()+TTL})}catch{/* nothing to revoke */}}

export async function session(){const config=credentials();const raw=(await cookies()).get(NAME)?.value;if(!config||!raw)return null;const [payload,sig]=raw.split('.');if(!payload||!sig)return null;const expected=sign(payload,config.hash);const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return null;try{const v=JSON.parse(Buffer.from(payload,'base64url').toString());if(!(v.exp>Date.now()))return null;
 if(v.nonce&&await revoked(String(v.nonce)))return null;
 // Sliding window: any authenticated activity remembers the browser for
 // another five days from now.
 const exp=await issueCookie();return {expires:exp??v.exp};}catch{return null}}
export async function logout(){const raw=(await cookies()).get(NAME)?.value;if(raw)await revoke(raw);(await cookies()).delete(NAME)}
