import type {MetadataRoute} from 'next';
const routes = ['','about','work','ventures','services','creative','journal','timeline','now','contact'];
export default function sitemap():MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: 'https://kutimfire.com/' + path,
    lastModified,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path ? 0.7 : 1,
  }));
}
