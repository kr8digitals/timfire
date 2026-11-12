import {NextResponse} from 'next/server';
import {session} from '@/lib/auth';
import {listEnquiries} from '@/lib/db';
import {enquiryInbox} from '@/lib/enquiry';

export const dynamic = 'force-dynamic';

export async function GET(){
  const s = await session();
  if(!s) return NextResponse.json({message:'Unauthorised'},{status:401,headers:{'Cache-Control':'no-store'}});
  const stored = await listEnquiries();
  const enquiries = stored ?? enquiryInbox();
  return NextResponse.json({enquiries},{headers:{'Cache-Control':'no-store'}});
}
