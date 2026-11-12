import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { SERVICE_PAGES, servicePageBySlug } from '@/lib/services-content';
import { FORMS } from '@/lib/forms';
import { seed } from '@/lib/content';
import { SITE_ORIGIN } from '@/lib/site';
import EnquiryForm from '@/components/enquiry-form';

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) return {};
  const service = seed.services.find((s) => s.id === page.serviceId);
  const price =
    service && service.ngn !== null
      ? ` From ₦${service.ngn.toLocaleString()}${service.unit === 'hour' ? '/hour' : ''}.`
      : ' Quote-only.';
  return {
    title: `${page.name} — what it is, what it fixes, what it costs`,
    description: page.description + price,
    alternates: { canonical: `/services/${page.slug}` },
    openGraph: {
      title: `${page.name} | TIMFIRE`,
      description: page.description,
      url: `${SITE_ORIGIN}/services/${page.slug}`,
    },
  };
}

export default async function ServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) notFound();
  const service = seed.services.find((s) => s.id === page.serviceId);

  return (
    <main id="main">
      <section className="shell page-hero">
        <span className="eyebrow">{page.eyebrow}</span>
        <h1>
          {page.title}
          <br />
          <em>{page.accent}</em>
        </h1>
        <p className="page-lead">{page.lead}</p>
        {service && (
          <p className="lp-price">
            {service.ngn !== null ? (
              <>
                Starting at <strong>₦{service.ngn.toLocaleString()}</strong>
                {service.unit === 'hour' ? ' / hour' : ''} · {service.note}
              </>
            ) : (
              <>
                <strong>Quote-only</strong> · {service.note}
              </>
            )}
          </p>
        )}
      </section>

      <div className="shell">
        <div className="lp-blocks">
          {page.blocks.map((b, i) => (
            <section key={b.heading} className="lp-block">
              <h2>
                <span className="lp-n">{String(i + 1).padStart(2, '0')}</span> {b.heading}
              </h2>
              <p className="lp-body">{b.body}</p>
            </section>
          ))}
        </div>

        <div className="two-col section">
          <div>
            <h2>What you walk away with</h2>
            <ul className="outcomes">
              {page.outcomes.map((o) => (
                <li key={o}>
                  <CheckCircle2 size={17} aria-hidden="true" /> {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>How the work runs</h2>
            <ol className="steps">
              {page.process.map((p, i) => (
                <li key={p}>
                  <span className="n">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <section className="section" id="enquiry">
          <div className="form-panel">
            <div className="form-panel-head">
              <span className="eyebrow">Enquiry</span>
              <h2>{page.title} {page.accent}</h2>
              <p className="muted">{FORMS[page.formKind].intro}</p>
            </div>
            <EnquiryForm kind={page.formKind} />
          </div>
        </section>

        <nav className="related" aria-label="Related pages">
          <strong>Keep exploring</strong>
          <Link href="/services">All services &amp; pricing ↗</Link>
          <Link href="/work">Selected work ↗</Link>
          <Link href="/contact">Other enquiries ↗</Link>
        </nav>
      </div>
    </main>
  );
}
