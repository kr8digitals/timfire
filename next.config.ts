import type { NextConfig } from 'next';
const production=process.env.VERCEL_ENV==='production';
const frame=production?"; frame-ancestors 'self'":'';
const script=process.env.NODE_ENV==='development'?"'self' 'unsafe-inline' 'unsafe-eval'":"'self' 'unsafe-inline'";
const config: NextConfig = {
  poweredByHeader:false,
  async headers(){return [{source:'/:path*',headers:[
    {key:'Content-Security-Policy',value:`default-src 'self'; script-src ${script}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.frankfurter.app; media-src 'self' data: blob: https:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self'${frame}`},
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    ...(production?[{key:'X-Frame-Options',value:'SAMEORIGIN'}]:[])
  ]}];}
};
export default config;
