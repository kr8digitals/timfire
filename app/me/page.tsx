import type {Metadata} from 'next';
import Section from '@/components/sections';
const description='Every poem, spoken-word piece, penlight essay and Good Report — posted for whoever needs it. This page belongs to the reader, not the writer.';
export const metadata:Metadata={title:'Me',description,alternates:{canonical:'/me'},openGraph:{title:'Me | TIMFIRE',description,images:['/images/og.jpg']}};
export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:'https://kutimfire.com'},{'@type':'ListItem',position:2,name:'Me',item:'https://kutimfire.com/me'}]})}}/><Section section="journal"/></>}
