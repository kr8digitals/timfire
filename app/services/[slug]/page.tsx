import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft, CheckCircle2, MinusCircle, Clock, ShieldCheck } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { resolveServices, serviceByKey } from '@/lib/services';
import { SERVICE_FORMS } from '@/lib/forms';
import { Related } from '@/components/site/ui';
import { Reveal } from '@/components/site/motion';
import { CurrencyProvider } from '@/components/site/currency';
import EnquiryForm from '@/components/site/enquiry-form';
import { formatMoney } from '@/lib/currency';
import { SITE_URL } from '@/lib/site';

export async function generateStaticParams() {
  const content = await getContent();
  return resolveServices(content.serviceOverrides)
    .filter((s) => s.enabled)
    .map((s) => ({ slug: s.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const service = resolveServices(content.serviceOverrides).find((s) => s.key === slug);
  if (!service || !service.enabled) return { title: 'Service not found', robots: { index: false, follow: false } };
  const price =
    service.ngn === null
      ? 'Scoped per project'
      : `From ${formatMoney(service.ngn, 'NGN')}${service.unit === 'hour' ? ' per hour' : ''}`;
  return {
    title: `${service.name} — ${price}`,
    description: `${service.summary} ${service.heroLead.slice(0, 100)}`,
    alternates: { canonical: `/services/${service.key}` },
    openGraph: {
      title: `${service.name} | TIMFIRE`,
      description: service.summary,
      images: [{ url: service.image, alt: service.imageAlt }],
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const services = resolveServices(content.serviceOverrides);
  const service = services.find((s) => s.key === slug);
  const form = SERVICE_FORMS[slug as keyof typeof SERVICE_FORMS];
  if (!service || !service.enabled || !form) notFound();

  const related = service.related
    .map((key) => serviceByKey(key))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const whatsappHref = `https://wa.me/2348166552758?text=${encodeURIComponent(`Hi Timfire — I'd like to talk about ${service.name.toLowerCase()}.`)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
          { '@type': 'ListItem', position: 3, name: service.name, item: `${SITE_URL}/services/${service.key}` },
        ],
      },
      {
        '@type': 'Service',
        name: service.name,
        serviceType: service.eyebrow,
        description: service.summary,
        url: `${SITE_URL}/services/${service.key}`,
        provider: {
          '@type': 'Person',
          name: 'Kenneth Timothy Iziogo',
          alternateName: 'TIMFIRE',
          url: SITE_URL,
          email: 'hi@kutimfire.com',
        },
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        ...(service.ngn !== null
          ? {
              offers: {
                '@type': 'Offer',
                price: service.ngn,
                priceCurrency: 'NGN',
                url: `${SITE_URL}/services/${service.key}`,
                availability: 'https://schema.org/InStock',
                description: service.priceNote,
              },
            }
          : {}),
      },
      {
        '@type': 'FAQPage',
        mainEntity: service.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <CurrencyProvider rates={content.settings.rates}>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* Hero */}
        <section className="page-hero">
          <span className="hero-art-line" aria-hidden="true" />
          <div className="shell two-col wide-left" style={{ alignItems: 'center' }}>
            <div>
              <Link href="/services" className="text-link" style={{ marginBottom: 20 }}>
                <ArrowLeft size={15} aria-hidden="true" /> All services
              </Link>
              <span className="eyebrow" style={{ marginBottom: 14 }}>{service.eyebrow}</span>
              <h1 style={{ fontSize: 'clamp(2.2rem,4.8vw,4.2rem)', margin: '12px 0 18px' }}>
                {service.heroTitle} <em>{service.heroAccent}</em>
              </h1>
              <p className="page-lead">{service.heroLead}</p>

              <div className="cluster" style={{ marginTop: 26, gap: 10 }}>
                <span className="badge orange">
                  {service.ngn === null ? 'Scoped per project' : `From ${formatMoney(service.ngn, 'NGN')}${service.unit === 'hour' ? ' / hour' : ''}`}
                </span>
                <span className="badge outline">
                  <Clock size={12} aria-hidden="true" /> {service.process[0].duration} – {service.process[service.process.length - 1].duration}
                </span>
                <span className="badge outline">
                  <ShieldCheck size={12} aria-hidden="true" /> Fixed price agreed in writing
                </span>
              </div>

              <div className="actions">
                <a href="#enquire" className="button primary">
                  {form.heading} <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a href={whatsappHref} className="button ghost" target="_blank" rel="noopener noreferrer">
                  Ask a question first
                </a>
              </div>
            </div>

            <Reveal delay={0.08}>
              <div className="photo-card" style={{ maxHeight: 560 }}>
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  width={1200}
                  height={900}
                  priority
                  sizes="(max-width: 860px) 92vw, 44vw"
                  style={{ maxHeight: 560, objectFit: 'cover' }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* The problem, honestly stated */}
        <section className="section section-ruled">
          <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,72px)' }}>
            <div>
              <Reveal>
                <span className="eyebrow">Why this exists</span>
                <h2 style={{ margin: '14px 0 20px' }}>
                  The problem it <em>actually solves.</em>
                </h2>
              </Reveal>
            </div>
            <div>
              {service.problem.map((para, i) => (
                <Reveal key={para.slice(0, 20)} delay={i * 0.05}>
                  <p style={{ fontSize: '1.02rem', lineHeight: 1.72, color: i === 0 ? '#e9dfd8' : 'var(--muted)' }}>{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What is included */}
        <section className="section section-ruled">
          <div className="shell">
            <Reveal>
              <div className="sectionhead stackhead">
                <span className="eyebrow">What is included</span>
                <h2>
                  Exactly what you <em>get.</em>
                </h2>
                <p>No vague deliverables. If it is on this list, it is in the price.</p>
              </div>
            </Reveal>
            <div className="page-grid">
              {service.includes.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.04}>
                  <div className="card flat" style={{ height: '100%', display: 'grid', gap: 8, alignContent: 'start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.06rem', display: 'flex', gap: 9, alignItems: 'baseline' }}>
                      <CheckCircle2 size={17} aria-hidden="true" style={{ color: 'var(--orange)', flex: 'none', transform: 'translateY(2px)' }} />
                      {item.title}
                    </h3>
                    <p className="muted" style={{ margin: 0, fontSize: '.94rem' }}>{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section section-ruled">
          <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,72px)' }}>
            <Reveal>
              <div style={{ position: 'sticky', top: 100 }}>
                <span className="eyebrow">How it runs</span>
                <h2 style={{ margin: '14px 0 16px' }}>
                  From first message to <em>finished.</em>
                </h2>
                <p className="muted">
                  You always know what stage we are at, what is needed from you and what happens next. The durations are
                  realistic, not optimistic.
                </p>
                <div className="card flat" style={{ marginTop: 22 }}>
                  <span className="kicker">Price</span>
                  <p className="price" style={{ margin: '6px 0 4px' }}>
                    {service.ngn === null ? 'Quoted per project' : `From ${formatMoney(service.ngn, 'NGN')}`}
                    {service.unit === 'hour' && service.ngn !== null && <small>per hour</small>}
                    {service.ngn !== null && service.unit === 'project' && <small>starting price per project</small>}
                  </p>
                  <p className="small muted" style={{ margin: 0, fontSize: '.85rem' }}>{service.priceNote}</p>
                  <p className="small" style={{ margin: '10px 0 0', fontSize: '.82rem', color: 'var(--muted-2)' }}>
                    Naira is the price you pay. Every other currency figure on this site is converted from the published
                    rate table.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="steps">
              {service.process.map((step) => (
                <div className="step" key={step.title}>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                  <span className="step-when">{step.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Outcomes + who it is for */}
        <section className="section section-ruled">
          <div className="shell two-col">
            <Reveal>
              <div className="card orange" style={{ height: '100%' }}>
                <span className="kicker" style={{ color: '#5a2c07' }}>What you end up with</span>
                <h2 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', margin: '10px 0 18px' }}>Outcomes, not deliverables</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                  {service.outcomes.map((outcome) => (
                    <li key={outcome} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: '#2a1509', fontWeight: 500 }}>
                      <CheckCircle2 size={17} aria-hidden="true" style={{ flex: 'none', marginTop: 3 }} />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="card flat" style={{ height: '100%' }}>
                <span className="kicker">Who this is for</span>
                <h2 style={{ fontSize: 'clamp(1.5rem,2.6vw,2rem)', margin: '10px 0 18px' }}>This is a good fit if…</h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                  {service.audiences.map((audience) => (
                    <li key={audience} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: 'var(--muted)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)', flex: 'none' }}>
                        →
                      </span>
                      {audience}
                    </li>
                  ))}
                </ul>
                <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 22, paddingTop: 18 }}>
                  <span className="kicker">Not a fit if…</span>
                  <p className="small muted" style={{ margin: '6px 0 0', display: 'flex', gap: 8 }}>
                    <MinusCircle size={15} aria-hidden="true" style={{ flex: 'none', marginTop: 3 }} />
                    you need it live tomorrow, or you are looking for the cheapest possible option rather than the
                    right one. I will tell you so honestly rather than take the work.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Form */}
        <section className="section section-ruled" id="enquire" style={{ scrollMarginTop: 90 }}>
          <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,64px)' }}>
            <div style={{ position: 'sticky', top: 100 }}>
              <span className="eyebrow">Next step</span>
              <h2 style={{ margin: '14px 0 16px' }}>
                Tell me about <em>your version.</em>
              </h2>
              <p className="muted">
                These questions are chosen for this service specifically, so my first reply can be a real answer rather
                than a request for more information.
              </p>
              <div className="card flat stack-sm" style={{ marginTop: 22 }}>
                <p className="small" style={{ margin: 0, color: 'var(--paper)', fontFamily: 'var(--font-display)' }}>
                  Prefer to talk first?
                </p>
                <p className="small muted" style={{ margin: 0 }}>
                  Send the same details on WhatsApp and I will usually reply the same day.
                </p>
                <div className="stack-sm" style={{ marginTop: 4 }}>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-link">
                    Message on WhatsApp <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                  <a href="mailto:hi@kutimfire.com" className="text-link">
                    hi@kutimfire.com
                  </a>
                </div>
              </div>
            </div>

            <EnquiryForm service={service.key} form={form} serviceName={service.name} fallbackWhatsApp={whatsappHref} />
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-ruled">
          <div className="shell">
            <Reveal>
              <div className="sectionhead stackhead">
                <span className="eyebrow">Questions people actually ask</span>
                <h2>
                  The honest <em>answers.</em>
                </h2>
              </div>
            </Reveal>
            <div className="stack" style={{ maxWidth: 860 }}>
              {service.faq.map((item, i) => (
                <Reveal key={item.q} delay={i * 0.04}>
                  <details className="card flat" style={{ padding: '18px 22px' }}>
                    <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.04rem', fontWeight: 600, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      {item.q}
                      <span aria-hidden="true" style={{ color: 'var(--orange)', fontSize: '1.3rem', lineHeight: 1 }}>+</span>
                    </summary>
                    <p className="muted" style={{ margin: '12px 0 0', fontSize: '.96rem' }}>{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Related services */}
        {related.length > 0 && (
          <section className="section section-ruled">
            <div className="shell">
              <h2 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', marginBottom: 20 }}>Often paired with</h2>
              <div className="page-grid three">
                {related.map((item) => (
                  <Link key={item.key} href={`/services/${item.key}`} className="card hoverable" style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                    <span className="badge outline" style={{ justifySelf: 'start' }}>{item.eyebrow}</span>
                    <h3 style={{ margin: 0, fontSize: '1.04rem' }}>{item.name}</h3>
                    <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>{item.summary}</p>
                    <span className="text-link" style={{ fontSize: '.9rem' }}>
                      Details <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="shell">
          <Related
            back={{ href: '/services', label: 'All services' }}
            links={[['/work', 'See the work'], ['/about', 'About me'], ['/contact', 'General contact']]}
          />
        </div>
      </main>
    </CurrencyProvider>
  );
}
