import type {Metadata} from 'next';
import localFont from 'next/font/local';
import './globals.css';
import {StoreProvider} from '@/lib/store';
import {Header,Footer} from '@/components/chrome';
import SubscribePopup from '@/components/subscribe-popup';
import SubscribeBar from '@/components/subscribe-bar';
import {CurrencyProvider} from '@/components/currency';
const display=localFont({src:'./fonts/display-latin.woff2',variable:'--font-display',display:'swap'});
const body=localFont({src:'./fonts/body-latin.woff2',variable:'--font-body',display:'swap'});
const serif=localFont({src:'./fonts/editorial.woff2',variable:'--font-editorial',display:'swap',preload:false});
export const metadata:Metadata={metadataBase:new URL('https://kutimfire.com'),alternates:{canonical:'/'},title:{default:'TIMFIRE — Welcome to my space',template:'%s | TIMFIRE'},description:'The personal space of TIMFIRE — websites, AI agents, creative work and KR8 DIGITALS.',openGraph:{type:'website',siteName:'TIMFIRE',images:[{url:'/images/og.jpg',width:1200,height:630,alt:'TIMFIRE welcomes you to his space'}]},robots:process.env.VERCEL_ENV==='preview'?{index:false,follow:false}:{index:true,follow:true},twitter:{card:'summary_large_image',images:['/images/og.jpg']}};
const SITE_JSONLD={'@context':'https://schema.org','@graph':[{'@type':'Person','@id':'https://kutimfire.com/#person','name':'Kenneth Timothy Iziogo','alternateName':'TIMFIRE','jobTitle':'Website developer & AI agent developer','founder':{'@type':'Organization','name':'KR8 DIGITALS','url':'https://kr8digitals.com'},'address':{'@type':'PostalAddress','addressLocality':'Abakaliki','addressRegion':'Ebonyi State','addressCountry':'NG'},'url':'https://kutimfire.com','image':'https://kutimfire.com/images/og.jpg'},{'@type':'WebSite','@id':'https://kutimfire.com/#site','url':'https://kutimfire.com','name':'TIMFIRE','description':'The personal space of TIMFIRE — websites, AI agents, creative work and KR8 DIGITALS.','publisher':{'@id':'https://kutimfire.com/#person'},'inLanguage':'en'}]};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(SITE_JSONLD)}}/><noscript><style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style></noscript><a href="#main" className="skip">Skip to content</a><StoreProvider><CurrencyProvider><SubscribeBar/><Header/>{children}<Footer/><SubscribePopup/></CurrencyProvider></StoreProvider></body></html>}
