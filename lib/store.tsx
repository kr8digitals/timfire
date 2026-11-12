'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {cloneSeed,SiteData} from './content';
import {validate} from './validate';
export {validate} from './validate';
const KEY='timfire-content-v1'; const BACKUP='timfire-safety-v1';
type Source='db'|'cache'|'seed';
type Store={data:SiteData;ready:boolean;source:Source;save:(d:SiteData)=>Promise<void>;restore:(d:unknown,mode:'merge'|'replace')=>Promise<void>};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}) {
 const [data,setData]=useState<SiteData>(cloneSeed);const [ready,setReady]=useState(false);const [source,setSource]=useState<Source>('seed');
 useEffect(()=>{
  let live=true;
  // Paint instantly from the local cache, then trust the database.
  try{const raw=localStorage.getItem(KEY);if(raw){setData(validate(JSON.parse(raw)));setSource('cache')}}catch(e){console.error('Cached content could not be read',e)}
  fetch('/api/content',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('content fetch '+r.status);return r.json()}).then(v=>{
   if(!live)return;const valid=validate(v);setData(valid);setSource('db');
   try{localStorage.setItem(KEY,JSON.stringify(valid))}catch{/* cache is best-effort */}
   setReady(true);
  }).catch(e=>{console.error('Content could not be loaded from the database',e);if(live)setReady(true)});
  return ()=>{live=false};
 },[]);
 async function save(d:SiteData){
  const valid=validate(d);setData(valid);
  try{localStorage.setItem(KEY,JSON.stringify(valid))}catch{/* cache is best-effort */}
  const r=await fetch('/api/admin/content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});
  if(!r.ok){const v=await r.json().catch(()=>null);throw new Error(v?.message||'Could not save to the database. This browser keeps a local copy.')}
 }
 async function restore(d:unknown,mode:'merge'|'replace') {
  const incoming=validate(d);localStorage.setItem(BACKUP,JSON.stringify(data));
  if(mode==='replace'){await save(incoming);return}
  const merged={...data,...incoming};
  const lists=['stats','services','websites','agents','creative','journal','timeline','certificates','testimonials','socials','media'] as const;
  for(const key of lists){const byId=new Map<string,unknown>(); for(const item of data[key])byId.set(item.id,item);for(const item of incoming[key])byId.set(item.id,item);(merged as unknown as Record<string,unknown>)[key]=[...byId.values()]}
  await save(merged);
 }
 return <Context.Provider value={{data,ready,source,save,restore}}>{children}</Context.Provider>;
}
export function useStore(){const c=useContext(Context);if(!c)throw Error('Missing store provider');return c}
export function safeUrl(url:string):string {try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function safeMedia(url:string):string {if(url.startsWith('data:image/')||url.startsWith('data:audio/')||url.startsWith('data:video/')||url.startsWith('/images/'))return url;return safeUrl(url)}
