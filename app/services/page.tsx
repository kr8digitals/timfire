import type {Metadata} from 'next';
import Section from '@/components/sections';
import {seed} from '@/lib/content';

export const metadata:Metadata={title:'Services',description:'Explore starting prices for website development, AI agents, design, SEO and one-on-one mentorship.',alternates:{canonical:'/services'},openGraph:{title:'Services | TIMFIRE',description:'Explore starting prices for website development, AI agents, design, SEO and one-on-one mentorship.',images:['/images/og.jpg']}};

const jsonLd = {
  '@context':'https://schema.org',
  '@graph':[
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://kutimfire.com'},
      {'@type':'ListItem',position:2,name:'Services',item:'https://kutimfire.com/services'},
    ]},
    {'@type':'ItemList',name:'Services offered by TIMFIRE',itemListElement:seed.services.filter(s=>s.enabled).map((s,i)=>({
      '@type':'ListItem',position:i+1,
      item:{'@type':'Service',name:s.name,description:s.note,provider:{'@type':'Person',name:'TIMFIRE',url:'https://kutimfire.com'},areaServed:'Worldwide',
        ...(s.ngn!==null?{offers:{'@type':'Offer',price:s.ngn,priceCurrency:'NGN',url:'https://kutimfire.com/contact'}}:{})},
    }))},
  ],
};

export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><Section section="services"/></>}
