import {NextResponse} from 'next/server';
import {session} from '@/lib/auth';
import {enquiryInbox} from '@/lib/enquiry';

export async function GET(){
  const s = await session();
  if(!s) return NextResponse.json({message:'Unauthorised'},{status:401,headers:{'Cache-Control':'no-store'}});
  const inbox = enquiryInbox();
  return NextResponse.json({enquiries: inbox},{headers:{'Cache-Control':'no-store'}});
}
