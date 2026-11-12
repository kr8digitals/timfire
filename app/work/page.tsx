import type {Metadata} from 'next';
import Section from '@/components/sections';
import {seed} from '@/lib/content';

export const metadata:Metadata={title:'Work',description:'Explore TIMFIRE’s selected website projects and AI agents, including KR8 DIGITALS and AFRISTEM Global.',alternates:{canonical:'/work'},openGraph:{title:'Work | TIMFIRE',description:'Explore TIMFIRE’s selected website projects and AI agents, including KR8 DIGITALS and AFRISTEM Global.',images:['/images/og.jpg']}};

const jsonLd = {
  '@context':'https://schema.org',
  '@graph':[
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://kutimfire.com'},
      {'@type':'ListItem',position:2,name:'Work',item:'https://kutimfire.com/work'},
    ]},
    {'@type':'ItemList',name:'Websites and AI agents by TIMFIRE',itemListElement:seed.websites.filter(w=>w.isPublic).map((w,i)=>({
      '@type':'ListItem',position:i+1,
      item:{'@type':'CreativeWork',name:w.name,description:w.description,creator:{'@type':'Person',name:'TIMFIRE'},url:w.url},
    }))},
  ],
};

export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><Section section="work"/></>}
