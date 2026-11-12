import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Code2, RotateCw, Search, Bot, Sparkles, PenTool, Clapperboard, GraduationCap, CheckCircle2 } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { resolveServices } from '@/lib/services';
import { PageHero, SectionHead, CTABlock, Related } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import { CurrencyProvider, CurrencyBar, PriceTag } from '@/components/site/currency';
import { CURRENCIES } from '@/lib/currency';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Services & prices',
  description:
    'Website development, redesigns, audits, AI agents, SEO, graphic design, branding, video editing and one-on-one mentorship. Naira prices, with published exchange rates for other currencies.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Services & prices | TIMFIRE',
    description: 'What each service costs, what is included, and how to start. Naira base, published conversion rates.',
    images: ['/images/og.jpg'],
  },
};

const ICONS = {
  code: Code2,
  refresh: RotateCw,
  search: Search,
  bot: Bot,
  trending: Sparkles,
  pen: PenTool,
  sparkles: Sparkles,
  video: Clapperboard,
  graduation: GraduationCap,
} as const;

export default async function ServicesPage() {
  const content = await getContent();
  const services = resolveServices(content.serviceOverrides);
  const enabled = services.filter((s) => s.enabled);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Services offered by TIMFIRE',
        itemListElement: enabled.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: s.name,
            description: s.summary,
            serviceType: s.eyebrow,
            provider: { '@type': 'Person', name: 'Kenneth Timothy Iziogo', url: SITE_URL },
            areaServed: { '@type': 'Place', name: 'Worldwide' },
            url: `${SITE_URL}/services/${s.key}`,
            ...(s.ngn !== null
              ? {
                  offers: {
                    '@type': 'Offer',
                    price: s.ngn,
                    priceCurrency: 'NGN',
                    url: `${SITE_URL}/services/${s.key}`,
                    availability: 'https://schema.org/InStock',
                    description: s.priceNote,
                  },
                }
              : {}),
          },
        })),
      },
    ],
  };

  return (
    <CurrencyProvider rates={content.settings.rates}>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <PageHero
          eyebrow="Ways to work together"
          title="Clear scope,"
          accent="clear price."
          lead="Every service below has its own page explaining exactly what is included, what it costs, how long it takes and what it will not do. No discovery call required to find out the price."
        >
          <div className="cluster" style={{ marginTop: 26 }}>
            <span className="badge orange">{enabled.length} services</span>
            <span className="badge outline">{CURRENCIES.length} currencies</span>
            <span className="badge outline">Naira is the base price</span>
          </div>
        </PageHero>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell stack">
            <Reveal>
              <CurrencyBar updated={content.settings.ratesUpdated} />
            </Reveal>

            <Stagger className="page-grid" gap={0.06}>
              {enabled.map((service) => {
                const Icon = ICONS[service.icon];
                return (
                  <StaggerItem key={service.key}>
                    <div className="card hoverable" style={{ display: 'grid', gap: 14, height: '100%', alignContent: 'start' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <span
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: '#f27a1a1a',
                            color: 'var(--orange)',
                            display: 'grid',
                            placeItems: 'center',
                            border: '1px solid #f27a1a33',
                            flex: 'none',
                          }}
                        >
                          <Icon size={21} aria-hidden="true" />
                        </span>
                        <span className="kicker" style={{ fontSize: '.7rem', textAlign: 'right' }}>{service.eyebrow}</span>
                      </div>

                      <h2 style={{ fontSize: 'clamp(1.3rem,2.2vw,1.62rem)', margin: 0, letterSpacing: '-.03em' }}>
                        <Link href={`/services/${service.key}`} style={{ textDecoration: 'none' }}>
                          {service.name}
                        </Link>
                      </h2>
                      <p className="muted" style={{ margin: 0, fontSize: '.96rem' }}>{service.summary}</p>

                      <PriceTag ngn={service.ngn} unit={service.unit} note={service.priceNote} id={`price-${service.key}`} />

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 7 }}>
                        {service.outcomes.slice(0, 3).map((o) => (
                          <li key={o} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: '.9rem', color: 'var(--muted)' }}>
                            <CheckCircle2 size={15} aria-hidden="true" style={{ color: 'var(--orange)', flex: 'none', marginTop: 3 }} />
                            {o}
                          </li>
                        ))}
                      </ul>

                      <div className="actions" style={{ marginTop: 'auto', paddingTop: 6 }}>
                        <Link href={`/services/${service.key}`} className="button small primary">
                          Details &amp; form <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>

        <section className="section section-ruled">
          <div className="shell">
            <SectionHead
              eyebrow="About these prices"
              title="Honest about what a price"
              accent="does not cover."
              stack
            />
            <div className="service-notes" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 34 }}>
              <div style={{ borderTop: '2px solid var(--orange)', paddingTop: 14, display: 'grid', gap: 6 }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.02rem' }}>Starting points, not ceilings</strong>
                <span className="muted" style={{ fontSize: '.92rem' }}>
                  Each price is for the smallest version of that service. More pages, more features or more content
                  migration cost more — and you get that number in writing before work starts.
                </span>
              </div>
              <div style={{ borderTop: '2px solid var(--orange)', paddingTop: 14, display: 'grid', gap: 6 }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.02rem' }}>Naira, always</strong>
                <span className="muted" style={{ fontSize: '.92rem' }}>
                  Prices are set in naira and you pay in naira. Converted figures are equivalent estimates from a
                  published rate table, dated and reviewed monthly — not a second price list.
                </span>
              </div>
              <div style={{ borderTop: '2px solid var(--orange)', paddingTop: 14, display: 'grid', gap: 6 }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.02rem' }}>Third-party costs are separate</strong>
                <span className="muted" style={{ fontSize: '.92rem' }}>
                  Domains, hosting, paid fonts or stock photography are paid by you, direct to the provider, in your
                  own name. I will tell you the likely amount before you commit.
                </span>
              </div>
            </div>
          </div>
        </section>

        <CTABlock
          eyebrow="Not sure which one"
          title="Describe the problem,"
          accent="not the service."
          lead="If you are not sure whether you need a new website, a rebuild, an audit or just an SEO fix, tell me what is going wrong and I will point at the right one."
          primary={{ href: '/contact', label: 'Ask me directly' }}
          secondary={{ href: '/services/audit', label: 'Start with an audit' }}
        />

        <div className="shell">
          <Related links={[['/work', 'See the work'], ['/about', 'About me'], ['/contact', 'Contact']]} />
        </div>
      </main>
    </CurrencyProvider>
  );
}
