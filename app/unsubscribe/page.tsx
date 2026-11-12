import type { Metadata } from 'next';
import Link from 'next/link';
import { unsubscribeByToken } from '@/lib/email';

export const metadata: Metadata = {
  title: 'Unsubscribed',
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const done = token ? await unsubscribeByToken(token) : false;
  return (
    <main id="main" className="shell page-hero" style={{ maxWidth: 760 }}>
      <span className="eyebrow">The list</span>
      <h1>
        {done ? (
          <>
            You are off the list, <em>and welcome back anytime.</em>
          </>
        ) : (
          <>
            This link has <em>already done its job.</em>
          </>
        )}
      </h1>
      <p className="page-lead">
        {done
          ? 'No further updates will come to this address. Nothing was deleted out of spite — subscribe again from any page and the door opens as if you never left.'
          : 'Either this address was already unsubscribed, or the link is incomplete. Either way, nothing more will be sent to it from this link.'}
      </p>
      <div className="actions">
        <Link href="/" className="button primary">
          Back to the site
        </Link>
        <Link href="/contact" className="button ghost">
          Say something instead
        </Link>
      </div>
    </main>
  );
}
