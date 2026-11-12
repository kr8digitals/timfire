import type {Metadata} from 'next';import Detail from '@/components/detail';
export const metadata:Metadata={title:'Creative detail',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <Detail kind="creative" slug={decodeURIComponent(slug)}/>}
