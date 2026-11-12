'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
import {z} from 'zod';
import {cloneSeed,SiteData} from './content';
const status=z.enum(['draft','scheduled','published']); const visibility=z.enum(['public','private']); const s=z.string(); const b=z.boolean();
const service=z.object({id:s,name:s,ngn:z.number().nullable(),usd:z.number().nullable(),unit:s,note:s,enabled:b});
const website=z.object({id:s,name:s,url:s,description:s,image:s,isPublic:b,live:b,kind:s});
const agent=z.object({id:s,name:s,description:s,isPublic:b,buildType:z.enum(['Live','Private build']),url:s});
const creative=z.object({id:s,title:s,slug:s,category:z.enum(['Poetry','Spoken word','Music & piano']),body:s,mediaUrl:s,captionUrl:s.default(''),mediaType:z.enum(['none','audio','video','external']),status,visibility,publishAt:s});
const article=z.object({id:s,title:s,slug:s,category:s,tags:z.array(s),summary:s,body:s,status,visibility,publishAt:s});
const schema=z.object({version:z.literal(1),profile:z.object({name:s,location:s,intro:s,heroLine:s,heroWelcome:s,heroName:s,about:s}),stats:z.array(z.object({id:s,value:s,label:s,isPublic:b})),services:z.array(service),websites:z.array(website),agents:z.array(agent),creative:z.array(creative),journal:z.array(article),timeline:z.array(z.object({id:s,year:s,title:s,description:s,isPublic:b})),certificates:z.array(z.object({id:s,title:s,description:s,image:s,isPublic:b})),testimonials:z.array(z.object({id:s,quote:s,name:s,isPublic:b})),now:z.object({items:z.array(s),updated:s}),socials:z.array(z.object({id:s,name:s,url:s,isPublic:b})),settings:z.object({jambScore:s,showJambScore:b,rates:z.record(z.number().positive())}),media:z.array(z.object({id:s,src:s,alt:s})),revisions:z.record(z.array(z.object({time:s,value:z.unknown()})))});
export const validate=(data:unknown):SiteData=>schema.parse(data) as SiteData;
const KEY='timfire-content-v1'; const BACKUP='timfire-safety-v1';
type Store={data:SiteData;ready:boolean;save:(d:SiteData)=>void;restore:(d:unknown,mode:'merge'|'replace')=>void};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}) {
 const [data,setData]=useState<SiteData>(cloneSeed);const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setData(validate(JSON.parse(raw)));}catch(e){console.error('Content could not be loaded',e)}setReady(true)},[]);
 function save(d:SiteData){const valid=validate(d);localStorage.setItem(KEY,JSON.stringify(valid));setData(valid)}
 function restore(d:unknown,mode:'merge'|'replace') {const incoming=validate(d);localStorage.setItem(BACKUP,JSON.stringify(data)); if(mode==='replace'){save(incoming);return} const merged={...data,...incoming}; const lists=['stats','services','websites','agents','creative','journal','timeline','certificates','testimonials','socials','media'] as const; for(const key of lists){const byId=new Map<string,unknown>(); for(const item of data[key])byId.set(item.id,item);for(const item of incoming[key])byId.set(item.id,item);(merged as unknown as Record<string,unknown>)[key]=[...byId.values()]}save(merged)}
 return <Context.Provider value={{data,ready,save,restore}}>{children}</Context.Provider>
}
export function useStore(){const c=useContext(Context);if(!c)throw Error('Missing store provider');return c}
export function safeUrl(url:string):string {try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
export function safeMedia(url:string):string {if(url.startsWith('data:image/')||url.startsWith('data:audio/')||url.startsWith('data:video/')||url.startsWith('/images/'))return url;return safeUrl(url)}
