import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/journal/','/creative/']},sitemap:'https://kutimfire.com/sitemap.xml'}}
