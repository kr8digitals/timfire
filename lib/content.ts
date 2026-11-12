export type Visibility = 'public' | 'private';
export type Status = 'draft' | 'scheduled' | 'published';
export interface Service { id:string; name:string; ngn:number|null; usd:number|null; unit:string; note:string; enabled:boolean }
export interface Work { id:string; name:string; url:string; description:string; image:string; isPublic:boolean; live:boolean; kind:string }
export interface Agent { id:string; name:string; description:string; isPublic:boolean; buildType:'Live'|'Private build'; url:string }
export interface Creative { id:string; title:string; slug:string; category:'Poetry'|'Spoken word'|'Music & piano'; body:string; mediaUrl:string; captionUrl:string; mediaType:'none'|'audio'|'video'|'external'; status:Status; visibility:Visibility; publishAt:string }
export interface Article { id:string; title:string; slug:string; category:string; tags:string[]; summary:string; body:string; status:Status; visibility:Visibility; publishAt:string }
export interface TimelineItem { id:string; year:string; title:string; description:string; isPublic:boolean }
export interface Certificate { id:string; title:string; description:string; image:string; isPublic:boolean }
export interface Testimonial { id:string; quote:string; name:string; isPublic:boolean }
export interface Media { id:string; src:string; alt:string }
export interface Revision { time:string; value:unknown }
export interface SiteData {
 version:1; profile:{name:string;location:string;intro:string;heroLine:string;heroWelcome:string;heroName:string;about:string};
 stats:{id:string;value:string;label:string;isPublic:boolean}[]; services:Service[]; websites:Work[]; agents:Agent[];
 creative:Creative[]; journal:Article[]; timeline:TimelineItem[]; certificates:Certificate[]; testimonials:Testimonial[];
 now:{items:string[]; updated:string}; socials:{id:string;name:string;url:string;isPublic:boolean}[];
 settings:{jambScore:string;showJambScore:boolean;rates:Record<string,number>}; media:Media[]; revisions:Record<string,Revision[]>;
}
export const seed:SiteData={
 version:1, profile:{name:'TIMFIRE',location:'Abakaliki, Ebonyi State, Nigeria',intro:'Based in Abakaliki, Ebonyi State, Nigeria. Working remotely for anyone, anywhere.',heroLine:"You're the one I've been expecting.",heroWelcome:'Welcome to my space.',heroName:'I am Timfire.',about:'I build websites and AI agents, lead KR8 DIGITALS, and make room for words, music and learning.'},
 stats:[{id:'clients',value:'50+',label:'clients served',isPublic:true},{id:'students',value:'5,000+',label:'students taught free digital skills through KR8 DIGITALS',isPublic:true},{id:'mentees',value:'15',label:'one-on-one paid mentorship students',isPublic:true}],
 services:[
  {id:'website',name:'Website design & development',ngn:150000,usd:100,unit:'project',note:'Final price depends on your requirements.',enabled:true},
  {id:'ai',name:'AI agent development',ngn:200000,usd:135,unit:'project',note:'Final price depends on your requirements.',enabled:true},
  {id:'seo',name:'SEO optimisation',ngn:80000,usd:55,unit:'project',note:'Final price depends on your requirements.',enabled:true},
  {id:'graphic',name:'Graphic design',ngn:20000,usd:15,unit:'project',note:'Final price depends on your requirements.',enabled:true},
  {id:'branding',name:'Branding',ngn:100000,usd:70,unit:'project',note:'Final price depends on your requirements.',enabled:true},
  {id:'video',name:'Video editing',ngn:null,usd:null,unit:'project',note:'Varies by length and edits.',enabled:true},
  {id:'mentorship',name:'One-on-one mentorship',ngn:2500,usd:1.70,unit:'hour',note:'Pay as you learn.',enabled:true}],
 websites:[
  {id:'afristem',name:'AFRISTEM Global',url:'https://afristemglobal.org',description:'A website for STEM education, competitions and programmes.',image:'/images/afristem-site.webp',isPublic:true,live:true,kind:'Website'},
  {id:'primestem',name:'Prime STEM Nigeria',url:'https://primestemnigeria.afristemglobal.org',description:'A redesign on an AFRISTEM subdomain for STEM education and opportunities.',image:'',isPublic:true,live:true,kind:'Website redesign'},
  {id:'kr8',name:'KR8 DIGITALS',url:'https://kr8digitals.com',description:'The home of KR8 DIGITALS services, training and community.',image:'/images/kr8-site.webp',isPublic:true,live:true,kind:'Website'},
  {id:'chitom',name:'Chitom Raphah Hospital',url:'https://chitomraphahospital.com',description:'[ADD: project description]',image:'',isPublic:true,live:false,kind:'Website'},
  {id:'consistency',name:'Consistency Drill',url:'https://consistencydrill.com',description:'[ADD: project description]',image:'',isPublic:true,live:false,kind:'Website'},
  {id:'cirenes',name:'Cirenes Hotels',url:'https://cirenes-hotels-liart.vercel.app/',description:'The estate, rooms and rates, menu, events hall, gallery, guest book and a reservation flow.',image:'',isPublic:true,live:true,kind:'KR8 studio · Hotel'},
  {id:'saltlake',name:'Salt Lake Hotels',url:'https://salt-lake-hotels-kappa.vercel.app/',description:'Grounds, four room tiers confirmed over WhatsApp, a kitchen menu, evenings, events and a guest book.',image:'',isPublic:true,live:true,kind:'KR8 studio · Hotel'},
  {id:'monabliss',name:'Monabliss Hotels',url:'https://monabliss-hotels-green.vercel.app/',description:'Compound, rooms and prices, an amenity checklist, kitchen menu, reviews, events and a guest book.',image:'',isPublic:true,live:true,kind:'KR8 studio · Hotel'},
  {id:'galaxy',name:'Galaxy La-Palm Royal Resort',url:'https://galaxy-lapalm.vercel.app/',description:'Suites, the estate and grounds, dining, events and facilities including a cinema, games lounge and pool.',image:'',isPublic:true,live:true,kind:'KR8 studio · Resort'}],
 agents:[{id:'riya',name:'RIYA',description:'The AI assistant on KR8 DIGITALS.',isPublic:true,buildType:'Live',url:'https://kr8digitals.com'},
  {id:'beauty',name:'Beauty Shuts',description:'An autonomous YouTube agent for ideas, brainstorming, scripting, video generation, editing, posting, analytics and reporting.',isPublic:true,buildType:'Private build',url:''},
  {id:'aether',name:'Aether',description:'My personal accountability agent for monthly, weekly and daily schedules and reminders.',isPublic:true,buildType:'Private build',url:''},
  {id:'goj',name:'Goj',description:'My personal study agent.',isPublic:true,buildType:'Private build',url:''},
  {id:'tenny',name:'Tenny',description:'My WhatsApp AI chief of staff, managing five other WhatsApp agents and checking they deliver.',isPublic:true,buildType:'Private build',url:''}],
 creative:[{id:'p1',title:'[ADD: poem 1]',slug:'poem-1',category:'Poetry',body:'[ADD: poem]',mediaUrl:'',captionUrl:'',mediaType:'none',status:'draft',visibility:'public',publishAt:''},{id:'p2',title:'[ADD: poem 2]',slug:'poem-2',category:'Poetry',body:'[ADD: poem]',mediaUrl:'',captionUrl:'',mediaType:'none',status:'draft',visibility:'public',publishAt:''},{id:'p3',title:'[ADD: poem 3]',slug:'poem-3',category:'Poetry',body:'[ADD: poem]',mediaUrl:'',captionUrl:'',mediaType:'none',status:'draft',visibility:'public',publishAt:''},{id:'s1',title:'[ADD: spoken word]',slug:'spoken-word',category:'Spoken word',body:'[ADD: spoken word]',mediaUrl:'',captionUrl:'',mediaType:'none',status:'draft',visibility:'public',publishAt:''},{id:'m1',title:'[ADD: music or piano]',slug:'music',category:'Music & piano',body:'[ADD: music or piano]',mediaUrl:'',captionUrl:'',mediaType:'none',status:'draft',visibility:'public',publishAt:''}],
 journal:[], timeline:[{id:'school',year:'2018',title:'Nnodo Secondary School',description:'Started secondary school in September.',isPublic:true},{id:'essay',year:'2023',title:'Coal City University essay competition',description:'Selected as a finalist in the national essay competition on Drug Abuse.',isPublic:true},{id:'graduation',year:'2024',title:'Graduated secondary school',description:'Completed studies at Nnodo Secondary School.',isPublic:true},{id:'founding',year:'[ADD: year]',title:'Founded KR8 DIGITALS',description:'Started KR8 DIGITALS. [ADD: exact founding month and year]',isPublic:true},{id:'jamb',year:'2026',title:'JAMB UTME',description:'Wrote the JAMB UTME.',isPublic:true},{id:'university',year:'2026',title:'Ebonyi State University',description:'Admitted to study Linguistics.',isPublic:true}],
 certificates:[{id:'essay-cert',title:'Coal City University essay competition',description:'[ADD: certificate scan; VERIFY: final result]',image:'',isPublic:false}],testimonials:[],
 now:{items:['Studying Linguistics.','Running KR8 DIGITALS.','Building AI agents and websites.','[ADD: what else is happening now]'],updated:''},
 socials:[{id:'facebook',name:'Facebook',url:'https://www.facebook.com/share/1EHJ272qmK/',isPublic:true},{id:'instagram',name:'Instagram',url:'https://www.instagram.com/timfire3/',isPublic:true},{id:'tiktok',name:'TikTok',url:'https://www.tiktok.com/@kutimfire',isPublic:true},{id:'linkedin',name:'LinkedIn',url:'',isPublic:false},{id:'x',name:'X',url:'',isPublic:false},{id:'youtube',name:'YouTube',url:'',isPublic:false}],
 settings:{jambScore:'',showJambScore:false,rates:{USD:1}},media:[],revisions:{}
};
export function isPublished(item:{status:Status;visibility:Visibility;publishAt:string}):boolean {
 return item.visibility==='public'&&(item.status==='published'||(item.status==='scheduled'&&!!item.publishAt&&new Date(item.publishAt).getTime()<=Date.now()));
}
export const cloneSeed=():SiteData=>JSON.parse(JSON.stringify(seed));
