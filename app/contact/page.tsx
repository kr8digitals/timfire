import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Mail, MessageCircle, MapPin, Clock, Code2, Bot, PenTool, Sparkles, Clapperboard, GraduationCap, RotateCw, Search } from 'lucide-react';
import { getContent } from '@/lib/cms/store';
import { resolveServices } from '@/lib/services';
import { CONTACT_FORM } from '@/lib/forms';
import { PageHero, Related } from '@/components/site/ui';
import { Reveal, Stagger, StaggerItem } from '@/components/site/motion';
import EnquiryForm from '@/components/site/enquiry-form';
import { CurrencyProvider } from '@/components/site/currency';

export const metadata: Metadata = {
  title: 'Contact — start a project',
  description:
    'Reach TIMFIRE by email, WhatsApp, or the enquiry form. Tell me what you are building and I will tell you honestly whether I am the right person to build it.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact TIMFIRE',
    description: 'Email, WhatsApp, or a purpose-built enquiry form.',
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

export default async function ContactPage() {
  const content = await getContent();
  const services = resolveServices(content.serviceOverrides).filter((s) => s.enabled);
  const whatsapp = 'https://wa.me/2348166552758?text=' + encodeURIComponent("Hi Timfire — I'd like to talk about a project.");

  return (
    <CurrencyProvider rates={content.settings.rates}>
      <main id="main">
        <PageHero
          eyebrow="Start a conversation"
          title="Tell me what you are"
          accent="trying to build."
          lead="Most conversations start with a sentence and end with either a scope or an honest recommendation to go elsewhere. Both are useful outcomes."
        >
          <div className="actions">
            <a href="mailto:hi@kutimfire.com" className="button primary">
              <Mail size={16} aria-hidden="true" /> Email me
            </a>
            <a href={whatsapp} className="button ghost" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </PageHero>

        {/* Contact details */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell">
            <div className="page-grid four">
              <Reveal>
                <div className="card flat" style={{ height: '100%' }}>
                  <Mail size={20} aria-hidden="true" style={{ color: 'var(--orange)' }} />
                  <h3 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>Email</h3>
                  <a href="mailto:hi@kutimfire.com" style={{ color: 'var(--orange)', wordBreak: 'break-word' }}>
                    hi@kutimfire.com
                  </a>
                  <p className="small muted" style={{ margin: '8px 0 0', fontSize: '.82rem' }}>
                    Best for detailed briefs and documents.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="card flat" style={{ height: '100%' }}>
                  <MessageCircle size={20} aria-hidden="true" style={{ color: 'var(--orange)' }} />
                  <h3 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>WhatsApp</h3>
                  <a href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>
                    +234 816 655 2758
                  </a>
                  <p className="small muted" style={{ margin: '8px 0 0', fontSize: '.82rem' }}>
                    Usually the fastest reply during the day.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="card flat" style={{ height: '100%' }}>
                  <MapPin size={20} aria-hidden="true" style={{ color: 'var(--orange)' }} />
                  <h3 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>Base</h3>
                  <p style={{ margin: 0 }}>Abakaliki, Ebonyi State, Nigeria</p>
                  <p className="small muted" style={{ margin: '8px 0 0', fontSize: '.82rem' }}>
                    Working remotely with clients anywhere.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="card flat" style={{ height: '100%' }}>
                  <Clock size={20} aria-hidden="true" style={{ color: 'var(--orange)' }} />
                  <h3 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>Hours</h3>
                  <p style={{ margin: 0 }}>West Africa Time (UTC+1)</p>
                  <p className="small muted" style={{ margin: '8px 0 0', fontSize: '.82rem' }}>
                    Messages answered evenings and weekends too, when possible.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Route to the right form */}
        <section className="section section-ruled">
          <div className="shell">
            <Reveal>
              <div className="sectionhead stackhead">
                <span className="eyebrow">Pick the right door</span>
                <h2>
                  Each service has its own <em>form.</em>
                </h2>
                <p>
                  This is on purpose. A web project needs different questions from a mentorship booking, and a form
                  that asks the right things means the first reply can be useful rather than another round of
                  questions.
                </p>
              </div>
            </Reveal>

            <Stagger className="page-grid three" gap={0.05}>
              {services.map((service) => {
                const Icon = ICONS[service.icon];
                return (
                  <StaggerItem key={service.key}>
                    <Link href={`/services/${service.key}#enquire`} className="card hoverable" style={{ height: '100%', display: 'grid', gap: 10, alignContent: 'start' }}>
                      <Icon size={19} aria-hidden="true" style={{ color: 'var(--orange)' }} />
                      <h3 style={{ margin: 0, fontSize: '1.02rem' }}>{service.name}</h3>
                      <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>{service.summary}</p>
                      <span className="text-link" style={{ fontSize: '.88rem', marginTop: 'auto', paddingTop: 6 }}>
                        Its form <ArrowUpRight size={14} aria-hidden="true" />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* General form */}
        <section className="section section-ruled" id="message" style={{ scrollMarginTop: 90 }}>
          <div className="shell two-col" style={{ alignItems: 'start', gap: 'clamp(28px,5vw,64px)' }}>
            <Reveal>
              <div style={{ position: 'sticky', top: 100 }}>
                <span className="eyebrow">Or just say hello</span>
                <h2 style={{ margin: '14px 0 18px' }}>
                  For everything <em>else.</em>
                </h2>
                <p className="muted">
                  If your question does not fit one of those services — speaking, collaboration, a problem with this
                  site, or something you have not decided yet — use this.
                </p>
                <div className="card flat" style={{ marginTop: 24 }}>
                  <p style={{ margin: 0, fontSize: '.94rem', color: 'var(--paper)' }}>
                    I read every message myself. There is no assistant answering this inbox, no autoresponder, and no
                    waiting list.
                  </p>
                  <p className="small muted" style={{ margin: '10px 0 0' }}>
                    If I am not the right person for what you need, I will say so and point you at someone better.
                  </p>
                </div>
              </div>
            </Reveal>

            <EnquiryForm service="contact" form={CONTACT_FORM} serviceName="General enquiry" fallbackWhatsApp={whatsapp} />
          </div>
        </section>

        <div className="shell">
          <Related links={[['/services', 'Services & pricing'], ['/work', 'Work'], ['/about', 'About']]} />
        </div>
      </main>
    </CurrencyProvider>
  );
}
