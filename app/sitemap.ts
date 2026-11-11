import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{return ['','about','work','ventures','services','creative','journal','timeline','now','contact'].map(path=>({url:'https://kutimfire.com/'+path,changeFrequency:'monthly',priority:path?0.7:1}))}
