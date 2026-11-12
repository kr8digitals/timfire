'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDown, Lock, MessageCircle, Mail, Code2, Bot, GraduationCap, Sparkles, PenLine, Users, BookOpen } from 'lucide-react';
import { isPublished } from '@/lib/content';
import { useStore, safeUrl, safeMedia } from '@/lib/store';
import { Reveal } from '@/components/motion';
import ContactForm from '@/components/contact-form';
import { Price, CurrencySelect } from '@/components/currency';
import { servicePageByServiceId } from '@/lib/services-content';

const pageCopy: Record<string, { eyebrow: string; title: string; accent: string; description: string }> = {
  about: {
    eyebrow: 'The person behind the work',
    title: 'A little more',
    accent: 'about me.',
    description: 'Websites, AI agents, words, music and a belief in creating opportunities.',
  },
  work: {
    eyebrow: 'Selected work',
    title: 'Built with',
    accent: 'purpose.',
    description: 'Website development and AI agents, made with care.',
  },
  ventures: {
    eyebrow: 'Founder · KR8 DIGITALS',
    title: 'Think it.',
    accent: 'KR8 it.',
    description: 'A creative ecosystem of services, free digital skills training and community.',
  },
  services: {
    eyebrow: 'Ways to work together',
    title: 'Make the idea',
    accent: 'real.',
    description: 'Clear starting prices. The final scope and cost depend on your requirements.',
  },
  creative: {
    eyebrow: 'The creative space',
    title: 'Code is one',
    accent: 'of my languages.',
    description: 'Poetry, spoken word, music, piano and the stage — the practices that teach the ear everything the keyboard later uses.',
  },
  journal: {
    eyebrow: 'The journal',
    title: 'Published',
    accent: 'and forthcoming.',
    description: 'Poems, spoken word, articles, books and announcements — indexed for search the moment they go live.',
  },
  timeline: {
    eyebrow: 'The journey',
    title: 'One chapter',
    accent: 'at a time.',
    description: 'A growing timeline of milestones.',
  },
  now: {
    eyebrow: 'The present chapter',
    title: 'What I am',
    accent: 'doing now.',
    description: 'A snapshot of what is taking my attention.',
  },
  contact: {
    eyebrow: 'Let’s talk',
    title: 'Have something',
    accent: 'in mind?',
    description: 'Send a message, email me directly, or start a conversation on WhatsApp.',
  },
};

export function Heading({ section }: { section: string }) {
  const x = pageCopy[section];
  return (
    <section className="shell page-hero">
      <span className="eyebrow">{x.eyebrow}</span>
      <h1>
        {x.title}
        <br />
        <em>{x.accent}</em>
      </h1>
      <p className="page-lead">{x.description}</p>
    </section>
  );
}

function Related({ links }: { links: [string, string][] }) {
  return (
    <nav className="related" aria-label="Related pages">
      <strong>Keep exploring</strong>
      {links.map(([n, h]) => (
        <Link href={h} key={h}>
          {n} ↗
        </Link>
      ))}
    </nav>
  );
}

function PImage({ src, alt, width = 928, height = 1152, className }: { src: string; alt: string; width?: number; height?: number; className?: string }) {
  return <Image src={src} alt={alt} width={width} height={height} sizes="(max-width:800px) 90vw, 45vw" className={className} />;
}

export default function Section({ section }: { section: string }) {
  const { data } = useStore();
  return (
    <main id="main">
      {section !== 'work' && section !== 'ventures' && section !== 'about' && <Heading section={section} />}
      <div className="shell">
        {section === 'about' && <About />}
        {section === 'work' && <Work />}
        {section === 'ventures' && <Ventures />}
        {section === 'services' && <Services />}
        {section === 'creative' && <Creative />}
        {section === 'journal' && <Journal />}
        {section === 'timeline' && <Timeline />}
        {section === 'now' && <Now />}
        {section === 'contact' && <Contact />}
      </div>
    </main>
  );
}

function About() {
  const { data } = useStore();
  return (
    <>
      <section className="shell work-hero about-hero">
        <Reveal>
          <div>
            <span className="eyebrow">About</span>
            <h1>
              The name behind
              <br />
              <em>the work.</em>
            </h1>
            <p className="page-lead">
              I am Kenneth Timothy Iziogo — Timfire to the internet. A developer, writer and speaker from Abakaliki,
              Ebonyi State, Nigeria, building for anyone, anywhere.
            </p>
            <div className="role-list">
              <span className="badge">
                <Code2 size={15} /> Website developer
              </span>
              <span className="badge">
                <Bot size={15} /> AI agent developer
              </span>
              <span className="badge">
                <GraduationCap size={15} /> Founder &amp; CEO, KR8 DIGITALS
              </span>
            </div>
            <div className="actions">
              <Link href="/timeline" className="button primary">
                Explore the timeline <ArrowUpRight size={18} />
              </Link>
              <Link href="/work" className="button ghost">
                See the work first <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card about-photo">
            <PImage src="/images/founder.webp" alt="TIMFIRE, also known as Kenneth Timothy Iziogo, in a dark suit" width={928} height={1152} />
          </div>
        </Reveal>
      </section>

      <Reveal>
        <div className="copy-panel about-story">
          <span className="eyebrow">The short version</span>
          <h2>
            My name is <em>Timfire.</em>
          </h2>
          <p>
            I am Kenneth Timothy Iziogo, based in Abakaliki, Ebonyi State, Nigeria. I work remotely for anyone,
            anywhere.
          </p>
          <p>{data.profile.about}</p>
          <p>
            I attended Nnodo Secondary School, Abakaliki, from September 2018 until graduating in 2024. In 2026, I
            wrote the JAMB UTME and was admitted to study Linguistics at Ebonyi State University.
          </p>
          {data.settings.showJambScore && data.settings.jambScore && <p>JAMB UTME score: {data.settings.jambScore}</p>}
          <p>In 2023, I was a finalist in Coal City University’s national essay competition on Drug Abuse. [ADD: certificate scan]</p>
        </div>
      </Reveal>

      <div className="two-col section">
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">Beyond the screen</span>
            <h2>
              A developer with a <em>creative life.</em>
            </h2>
            <p>
              The same care I bring to a website goes into words and music. Poetry, spoken word and piano are not a
              side note — they are part of how I think, notice and build.
            </p>
            <p>
              Through KR8 DIGITALS I also teach: free digital skills cohorts through KR8 Academy, and a community of
              creators through the KR8 Tribe.
            </p>
            <Link href="/creative" className="text-link">
              Visit the creative space <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card">
            <PImage src="/images/lifestyle.webp" alt="TIMFIRE leaning against a wall in a cream shirt and brown trousers" width={928} height={1152} />
          </div>
        </Reveal>
      </div>

      <section className="section">
        <Reveal>
          <h2>
            Certificates
          </h2>
          <p className="muted" style={{ maxWidth: 620 }}>
            Scans are added here once they have been supplied and checked.
          </p>
          <div className="page-grid" style={{ marginTop: 24 }}>
            {data.certificates.filter((c) => c.isPublic).length === 0 && (
              <article className="card">
                <span className="badge private">Awaiting scan</span>
                <h3>Coal City University essay competition</h3>
                <p className="muted">[ADD: certificate scan; VERIFY: final result]</p>
              </article>
            )}
            {data.certificates
              .filter((c) => c.isPublic)
              .map((c) => (
                <article className="card" key={c.id}>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  {safeMedia(c.image) && <img src={safeMedia(c.image)} alt={`Certificate: ${c.title}`} style={{ width: '100%', borderRadius: 12 }} />}
                </article>
              ))}
          </div>
        </Reveal>
      </section>

      <Related links={[['My work', '/work'], ["What I'm doing now", '/now'], ['Get in touch', '/contact']]} />
    </>
  );
}

function Work() {
  const { data } = useStore();
  const own = data.websites.filter((x) => x.isPublic && !x.kind.startsWith('KR8 studio'));
  const studio = data.websites.filter((x) => x.isPublic && x.kind.startsWith('KR8 studio'));
  const agents = data.agents.filter((x) => x.isPublic);
  return (
    <>
      <section className="shell work-hero">
        <Reveal>
          <div>
            <span className="eyebrow">Proof of capability</span>
            <h1>
              Real work,
              <br />
              <em>live and in use.</em>
            </h1>
            <p className="page-lead">
              Hotels taking reservations at midnight. STEM programmes taking registrations. An assistant answering
              customers on a real website right now. Everything on this page was built to do a job — and is judged by
              whether the job gets done.
            </p>
            <div className="cluster" style={{ marginTop: 22, gap: 10 }}>
              <span className="badge">{own.length + studio.length} websites</span>
              <span className="badge private">{agents.length} AI agents</span>
              <span className="badge private">Sole developer on every build</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="work-hero-art">
            <div className="shot a">
              <Image
                src="/images/afristem-site.webp"
                alt="Screenshot of the live AFRISTEM Global website"
                width={730}
                height={375}
                sizes="(max-width: 800px) 70vw, 40vw"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div className="shot b">
              <Image
                src="/images/kr8-site.webp"
                alt="Screenshot of the live KR8 DIGITALS website"
                width={1340}
                height={625}
                sizes="(max-width: 800px) 60vw, 34vw"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <span className="live-tag">
              <i aria-hidden="true" /> both live now
            </span>
          </div>
        </Reveal>
      </section>
      <Reveal>
        <div className="sectionhead">
          <div>
            <h2>
              Websites <em>built.</em>
            </h2>
          </div>
          <p>I am the sole developer of these websites.</p>
        </div>
      </Reveal>
      <div className="page-grid">
        {own.map((x, i) => (
          <Reveal key={x.id} delay={Math.min(i * 0.06, 0.24)}>
            <article className="card light" id={x.id}>
              {x.image && safeMedia(x.image) && (
                <img className="card-image" src={safeMedia(x.image)} alt={`Screenshot of ${x.name} website`} loading="lazy" />
              )}
              <span className="badge">{x.kind}</span>
              <h3>{x.name}</h3>
              <p>{x.description}</p>
              {x.live && safeUrl(x.url) && (
                <a className="text-link" style={{ color: '#842e00' }} href={safeUrl(x.url)} target="_blank" rel="noopener noreferrer">
                  Visit website <ArrowUpRight size={18} />
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 20 }}>
        And more.
      </p>

      <Reveal>
        <section className="cta-block" style={{ marginTop: 60 }}>
          <div>
            <span className="eyebrow">Your turn</span>
            <h2>
              Need a website? <em>Or a better one?</em>
            </h2>
            <p className="muted" style={{ marginTop: 12, maxWidth: 520 }}>
              A new build, a rebuild, a redesign, an audit or targeted fixes — each path is explained properly on its
              own page, with what it costs and exactly what you can expect from the process.
            </p>
          </div>
          <Link href="/services/website-design-development" className="button primary">
            Explore website development <ArrowUpRight size={18} />
          </Link>
        </section>
      </Reveal>

      {studio.length > 0 && (
        <>
          <Reveal>
            <div className="sectionhead" style={{ marginTop: 80 }}>
              <div>
                <h2>
                  From the <em>KR8 studio.</em>
                </h2>
              </div>
              <p>Websites engineered at KR8 DIGITALS, where I lead technical architecture.</p>
            </div>
          </Reveal>
          <div className="page-grid">
            {studio.map((x, i) => (
              <Reveal key={x.id} delay={Math.min(i * 0.06, 0.24)}>
                <article className="card" id={x.id}>
                  <span className="badge">{x.kind}</span>
                  <h3>{x.name}</h3>
                  <p className="muted">{x.description}</p>
                  {x.live && safeUrl(x.url) && (
                    <a className="text-link" href={safeUrl(x.url)} target="_blank" rel="noopener noreferrer">
                      Visit live site <ArrowUpRight size={18} />
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </>
      )}

      <Reveal>
        <div className="sectionhead" style={{ marginTop: 80 }}>
          <div>
            <h2>
              AI <em>agents.</em>
            </h2>
          </div>
          <p>Public and private builds, created by me.</p>
        </div>
      </Reveal>
      <div className="page-grid">
        {data.agents
          .filter((x) => x.isPublic)
          .map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i * 0.06, 0.24)}>
              <article className="card" id={a.id}>
                <span className={'badge ' + (a.buildType === 'Private build' ? 'private' : '')}>
                  {a.buildType === 'Private build' && <Lock size={14} />} {a.buildType}
                </span>
                <h3>{a.name}</h3>
                <p className="muted">{a.description}</p>
                {a.buildType === 'Live' && safeUrl(a.url) && (
                  <a className="text-link" href={safeUrl(a.url)} target="_blank" rel="noopener noreferrer">
                    Visit KR8 DIGITALS <ArrowUpRight size={18} />
                  </a>
                )}
              </article>
            </Reveal>
          ))}
      </div>
      <Reveal>
        <section className="cta-block" style={{ marginTop: 40 }}>
          <div>
            <span className="eyebrow">AI, built around your work</span>
            <h2>
              Need an AI agent <em>of your own?</em>
            </h2>
            <p className="muted" style={{ marginTop: 12, maxWidth: 520 }}>
              Not sure what an agent is, or whether your work has one hiding in it? The landing page explains both in
              plain language — and shows agents that are live today, answering real customers.
            </p>
          </div>
          <Link href="/services/ai-agent-development" className="button primary">
            See what an agent can do <ArrowUpRight size={18} />
          </Link>
        </section>
      </Reveal>
      <Related links={[['Services & pricing', '/services'], ['KR8 DIGITALS', '/ventures'], ['Contact', '/contact']]} />
    </>
  );
}

function Ventures() {
  return (
    <>
      <section className="shell work-hero ventures-hero">
        <Reveal>
          <div>
            <span className="eyebrow">Founder · KR8 DIGITALS</span>
            <h1>
              We create. We innovate.
              <br />
              <em>We deliver results.</em>
            </h1>
            <p className="page-lead">
              KR8 DIGITALS is a creative company: fast websites, brand identities that hold up in daylight, video, SEO
              and AI systems for organisations ready to lead. It exists for a second reason as well — the profit funds
              KR8 Academy, tuition-free training for the next generation of digital builders.
            </p>
            <p style={{ marginTop: 18 }}>
              <strong>THINK IT. KR8 IT.</strong>
            </p>
            <div className="actions">
              <a href="https://kr8digitals.com" className="button primary" target="_blank" rel="noopener noreferrer">
                Visit KR8 DIGITALS <ArrowUpRight size={18} />
              </a>
              <a href="#ecosystem" className="button ghost">
                Inside the ecosystem <ArrowDown size={18} />
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card ventures-photo">
            <PImage
              src="/images/supplied-founder.webp"
              alt="TIMFIRE, founder of KR8 DIGITALS, standing in a white shirt and brown trousers"
              width={1023}
              height={1537}
              className="face-first"
            />
          </div>
        </Reveal>
      </section>

      <Reveal>
        <blockquote className="quote-panel">
          <p>“Whoever you are, whatever you do, we exist because of you.”</p>
          <footer>The KR8 DIGITALS promise</footer>
        </blockquote>
      </Reveal>

      <Reveal>
        <div className="sectionhead section" id="ecosystem">
          <div>
            <span className="eyebrow">The ecosystem</span>
            <h2>
              Inside the KR8 <em>ecosystem.</em>
            </h2>
          </div>
          <p>Commercial work funds the free work. The free work builds the next builders.</p>
        </div>
      </Reveal>

      <div className="page-grid">
        <Reveal>
          <article className="card light">
            <span className="icon-badge">
              <BookOpen size={22} />
            </span>
            <h3>KR8 Academy</h3>
            <p>Practical, high-income digital skills — 100% tuition-free, taught through 8-week live cohorts with mentorship and a verifiable KR8 graduate ID.</p>
            <a className="text-link" style={{ color: '#842e00' }} href="https://academy.kr8digitals.com/" target="_blank" rel="noopener noreferrer">
              Start learning free <ArrowUpRight size={18} />
            </a>
          </article>
        </Reveal>
        <Reveal delay={0.08}>
          <article className="card">
            <span className="icon-badge">
              <Users size={22} />
            </span>
            <h3>KR8 Tribe</h3>
            <p className="muted">A community of 3,000+ African designers, developers, editors and founders — joining for collaboration, reviews, sprints and referrals.</p>
            <a className="text-link" href="https://www.kr8digitals.com/tribe" target="_blank" rel="noopener noreferrer">
              Explore the Tribe <ArrowUpRight size={18} />
            </a>
          </article>
        </Reveal>
        <Reveal delay={0.16}>
          <article className="card">
            <span className="icon-badge">
              <Sparkles size={22} />
            </span>
            <h3>Mindset Shift</h3>
            <p className="muted">A free live forum on discipline, career vision and the mindset behind building real work.</p>
            <a className="text-link" href="https://www.kr8digitals.com/programs" target="_blank" rel="noopener noreferrer">
              See the programmes <ArrowUpRight size={18} />
            </a>
          </article>
        </Reveal>
        <Reveal delay={0.24}>
          <article className="card">
            <span className="icon-badge">
              <PenLine size={22} />
            </span>
            <h3>The studio work</h3>
            <p className="muted">Websites, branding, graphic design, video editing, SEO and AI agents — delivered under one roof with co-founders Steveoking (Motionverse) and Creative Expression (Chigoma).</p>
            <a className="text-link" href="https://www.kr8digitals.com/services" target="_blank" rel="noopener noreferrer">
              KR8 services <ArrowUpRight size={18} />
            </a>
          </article>
        </Reveal>
      </div>

      <Reveal>
        <div className="cta-block section">
          <div>
            <span className="eyebrow">Work with KR8</span>
            <h2>
              Build with the <em>studio.</em>
            </h2>
          </div>
          <a className="button primary" href="https://www.kr8digitals.com/contact" target="_blank" rel="noopener noreferrer">
            Start a project <ArrowUpRight size={18} />
          </a>
        </div>
      </Reveal>

      <Related links={[['Work', '/work'], ['Services', '/services'], ['About', '/about']]} />
    </>
  );
}

const SVC_LINES: Record<string, string> = {
  website: 'A fast site built around the one action a visitor should take.',
  ai: 'Repetitive work handed to something grounded in your real rules.',
  seo: 'Found by the people who are already searching for you.',
  graphic: 'Two seconds of a stranger’s attention, won on purpose.',
  branding: 'Priced correctly in the customer’s head before you quote.',
  video: 'Cut for the first three seconds, captioned for sound-off.',
  mentorship: 'Pay as you learn, on your real project, one hour at a time.',
};

function Services() {
  const { data } = useStore();
  return (
    <>
      <Reveal>
        <p className="page-lead" style={{ maxWidth: 720 }}>
          A service is only worth listing if it solves a problem you can name. Below is what each one is and the
          problem it removes. Open any of them for the full explanation — what the work involves, what you walk away
          with, how the process runs — and the form built for that exact enquiry.
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="sectionhead" style={{ marginTop: 30, marginBottom: 0, alignItems: 'end' }}>
          <CurrencySelect />
          <p>Starting prices are naira-based and convert instantly. Scope changes the number — you always get a written quote first.</p>
        </div>
      </Reveal>
      <div className="page-grid" style={{ marginTop: 26 }}>
        {data.services
          .filter((x) => x.enabled)
          .map((x, i) => {
            const page = servicePageByServiceId(x.id);
            return (
              <Reveal key={x.id} delay={Math.min(i * 0.05, 0.3)}>
                <article className="card" id={x.id}>
                  <h3>{x.name}</h3>
                  {x.ngn !== null ? (
                    <Price ngn={x.ngn} unit={x.unit} />
                  ) : (
                    <p className="price">Request a quote</p>
                  )}
                  <p className="muted">{SVC_LINES[x.id] || x.note}</p>
                  <Link className="text-link" href={page ? `/services/${page.slug}` : '/contact'}>
                    Learn more <ArrowUpRight size={18} />
                  </Link>
                </article>
              </Reveal>
            );
          })}
      </div>

      <Reveal>
        <div className="service-notes">
          <div>
            <strong>Clear starting prices.</strong>
            <span>Scope changes, and so can the number — you always get a written quote first.</span>
          </div>
          <div>
            <strong>Built for mobile speed.</strong>
            <span>Sites are built to load fast on the phones most of your visitors actually use.</span>
          </div>
          <div>
            <strong>You own everything.</strong>
            <span>Domain, hosting and files are set up in your name, with a handover walkthrough.</span>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="feature-band section">
          <div className="photo-card">
            <PImage src="/images/mentorship.webp" alt="TIMFIRE speaking with open hands during a mentorship session" width={928} height={1152} />
          </div>
          <div className="copy-panel">
            <span className="eyebrow">Mentorship</span>
            <h2>
              Learn by <em>building.</em>
            </h2>
            <p>
              One-on-one mentorship is pay-as-you-learn: bring a real project, a stuck point or a career question, and
              we work through it together. Sessions are practical, not motivational.
            </p>
            <Link className="text-link" href="/services/mentorship">
              Book a session <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </Reveal>

      <Related links={[['Selected work', '/work'], ['Contact', '/contact']]} />
    </>
  );
}

function CreativePieces({ category }: { category: string }) {
  const { data } = useStore();
  const items = data.creative.filter(isPublished).filter((x) => x.category === category);
  if (!items.length)
    return (
      <div className="empty" style={{ marginTop: -20, marginBottom: 10 }}>
        New {category.toLowerCase()} work lands here first. Nothing is published yet — and nothing has been invented to
        fill the space.
      </div>
    );
  return (
    <div className="page-grid" style={{ marginBottom: 10 }}>
      {items.map((x) => (
        <article className="card light" key={x.id}>
          <span className="badge">{x.category}</span>
          <h3>{x.title}</h3>
          <Link className="text-link" style={{ color: '#842e00' }} href={'/creative/' + encodeURIComponent(x.slug)}>
            Read or listen <ArrowUpRight size={18} />
          </Link>
        </article>
      ))}
    </div>
  );
}

function Creative() {
  return (
    <>
      <section id="music" className="two-col section" style={{ paddingTop: 10 }}>
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">Music · singing · songwriting · keyboard · piano</span>
            <h2>
              Music is where I am <em>least in a hurry.</em>
            </h2>
            <p>
              I sing, I write songs, and I play piano and keyboard. Not four activities — one practice with four doors.
              A melody arrives before the words, or a line of lyric demands a chord under it, and the keyboard is where
              the two argue until they agree.
            </p>
            <p>
              Music is also where my ear for language was trained: rhythm, restraint, knowing when a verse has one line
              too many. Every page of copy I write is edited by that ear.
            </p>
            <div className="actions">
              <Link href="/collaborate/music" className="button primary">
                Request a music collaboration <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card creative-photo">
            <PImage src="/images/creative/music-studio.webp" alt="TIMFIRE standing in a music studio beneath a MUSIC sign" width={1402} height={1920} />
          </div>
        </Reveal>
      </section>
      <CreativePieces category="Music & piano" />

      <section id="spoken-word" className="two-col section">
        <Reveal delay={0.05}>
          <div className="photo-card creative-photo">
            <PImage src="/images/creative/spoken-stage.webp" alt="TIMFIRE performing spoken word on a stage" width={1200} height={1600} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="copy-panel">
            <span className="eyebrow">Spoken word</span>
            <h2>
              Writing with <em>a pulse.</em>
            </h2>
            <p>
              A spoken word piece is not finished on the page. It is finished when it survives a room: the pause that
              holds, the line that lands, the breath placed so the audience leans in. I write for the ear first and the
              page second.
            </p>
            <p>Performances, commissions, recordings and workshops — if your event needs a voice rather than a playlist, this is the door.</p>
            <div className="actions">
              <Link href="/collaborate/spoken-word" className="button primary">
                Request spoken word <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
      <CreativePieces category="Spoken word" />

      <section id="poetry" className="two-col section">
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">Poetry</span>
            <h2>
              The quietest <em>loud page.</em>
            </h2>
            <p>
              Poetry is compression: the most feeling in the fewest words. I write poems the way I write everything else
              now — in the open, in the Journal, revised in public when a revision is honest.
            </p>
            <p>Commissions, publication and joint work all begin the same way: with the subject, and why it matters to you.</p>
            <div className="actions">
              <Link href="/collaborate/poetry" className="button primary">
                Commission or collaborate <ArrowUpRight size={18} />
              </Link>
              <Link href="/journal" className="button ghost">
                Read the Journal <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card creative-photo">
            <PImage src="/images/creative/poetry-candle.webp" alt="TIMFIRE writing by candlelight" width={1200} height={1600} />
          </div>
        </Reveal>
      </section>
      <CreativePieces category="Poetry" />

      <section id="speaking" className="two-col section">
        <Reveal delay={0.05}>
          <div className="photo-card creative-photo">
            <PImage src="/images/creative/speaking.webp" alt="TIMFIRE speaking into a microphone in front of an audience" width={1200} height={1600} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="copy-panel">
            <span className="eyebrow">Public speaking</span>
            <h2>
              A room, and <em>something to say.</em>
            </h2>
            <p>
              I speak on discipline, building in public, digital skills and the plain language behind good work — to
              students, creators, churches and companies. Through KR8 Academy I teach eight-week cohorts, so a stage is
              never far away.
            </p>
            <p>I accept invitations when there is something worth saying to that particular room. Tell me about yours.</p>
            <div className="actions">
              <Link href="/collaborate/speaking" className="button primary">
                Invite me to speak <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Related links={[['Journal', '/journal'], ['About', '/about'], ['Now', '/now']]} />
    </>
  );
}

function Journal() {
  const { data } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [count, setCount] = useState(6);
  const items = data.journal.filter(isPublished);
  const categories = ['All', ...new Set(items.map((x) => x.category))];
  const found = items.filter(
    (x) => (cat === 'All' || cat === x.category) && [x.title, x.summary, ...x.tags].join(' ').toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <Reveal>
        <p className="page-lead" style={{ maxWidth: 720 }}>
          The publishing space: poems, spoken word, articles, books and announcements. Everything lands here the moment
          it is ready — search and categories below, the full text behind each title.
        </p>
      </Reveal>
      <div className="page-grid section" style={{ paddingTop: 0 }}>
        <div>
          <label htmlFor="journal-search" className="form-label">
            Search articles
          </label>
          <input
            id="journal-search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCount(6);
            }}
            placeholder="Search title, tag or topic"
          />
        </div>
        <div>
          <label htmlFor="journal-category" className="form-label">
            Category
          </label>
          <select
            id="journal-category"
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              setCount(6);
            }}
          >
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="page-grid" style={{ marginTop: 24 }}>
        {found.slice(0, count).map((x, i) => (
          <Reveal key={x.id} delay={Math.min(i * 0.05, 0.25)}>
            <article className="card light">
              <span className="badge">{x.category}</span>
              <h3>{x.title}</h3>
              <p>{x.summary}</p>
              <p>{Math.max(1, Math.ceil(x.body.trim().split(/\s+/).length / 200))} min read</p>
              {x.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
              <br />
              <Link className="text-link" style={{ color: '#842e00' }} href={'/journal/' + encodeURIComponent(x.slug)}>
                Read article <ArrowUpRight size={18} />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
      {!found.length && (
        <div className="empty" style={{ marginTop: 24 }}>
          {items.length ? (
            'No articles match your search yet.'
          ) : (
            <>
              <strong style={{ fontFamily: 'var(--font-display)', display: 'block', marginBottom: 8 }}>
                The shelf is built; the work is on its way.
              </strong>
              <p style={{ margin: '0 0 10px' }}>
                Poems, spoken word pieces, articles, books and announcements will be published here the moment they are
                finished, through the admin dashboard — and indexed for search the moment they are published. Until
                then, the creative space holds what is ready.
              </p>
              <Link className="text-link" href="/creative">
                Visit the creative space <ArrowUpRight size={18} />
              </Link>
            </>
          )}
        </div>
      )}
      {found.length > count && (
        <button className="button ghost" style={{ marginTop: 24 }} onClick={() => setCount(count + 6)}>
          Load more
        </button>
      )}
      <Related links={[['Creative', '/creative'], ['Timeline', '/timeline'], ['About', '/about']]} />
    </>
  );
}

function Timeline() {
  const { data } = useStore();
  return (
    <>
      <div className="timeline">
        {data.timeline
          .filter((x) => x.isPublic)
          .map((x, i) => (
            <Reveal key={x.id} delay={Math.min(i * 0.04, 0.2)}>
              <article className="timeline-item">
                <time>{x.year}</time>
                <h2>{x.title}</h2>
                <p className="muted">{x.description}</p>
              </article>
            </Reveal>
          ))}
      </div>
      <Related links={[['About', '/about'], ['Now', '/now'], ['Journal', '/journal']]} />
    </>
  );
}

function Now() {
  const { data } = useStore();
  return (
    <>
      <div className="two-col">
        <div>
          <Reveal>
            <span className="eyebrow">Now</span>
            <h2>
              This is the <em>current chapter.</em>
            </h2>
          </Reveal>
          <div className="list">
            {data.now.items.map((x, i) => (
              <Reveal key={i} delay={Math.min(i * 0.06, 0.24)}>
                <div className="card">{x}</div>
              </Reveal>
            ))}
          </div>
          {data.now.updated && <p className="muted">Updated {data.now.updated}</p>}
        </div>
        <Reveal delay={0.1}>
          <div className="photo-card">
            <PImage src="/images/supplied-now.webp" alt="TIMFIRE seated in a white turtleneck and khaki trousers" width={823} height={1536} />
          </div>
        </Reveal>
      </div>
      <Related links={[['Timeline', '/timeline'], ['Ventures', '/ventures'], ['Contact', '/contact']]} />
    </>
  );
}

function Contact() {
  const { data } = useStore();
  return (
    <>
      <div className="contact-layout">
        <Reveal>
          <ContactForm />
        </Reveal>
        <div className="stack">
          <Reveal delay={0.08}>
            <article className="card light">
              <span className="icon-badge">
                <Mail size={20} />
              </span>
              <h3>Send an email.</h3>
              <p>Reach me at hi@kutimfire.com.</p>
              <a className="text-link" style={{ color: '#842e00' }} href="mailto:hi@kutimfire.com">
                Email TIMFIRE <ArrowUpRight size={18} />
              </a>
            </article>
          </Reveal>
          <Reveal delay={0.16}>
            <article className="card">
              <span className="icon-badge">
                <MessageCircle size={20} />
              </span>
              <h3>Message on WhatsApp.</h3>
              <p className="muted">Start a conversation directly. Fastest for quick questions.</p>
              <a className="text-link" href="https://wa.me/2348166552758" target="_blank" rel="noopener noreferrer">
                Open WhatsApp <ArrowUpRight size={18} />
              </a>
            </article>
          </Reveal>
          <Reveal delay={0.24}>
            <article className="card">
              <h3>Elsewhere.</h3>
              <p className="muted">Social spaces where the work and the process show up.</p>
              <div className="socials">
                {data.socials
                  .filter((x) => x.isPublic && safeUrl(x.url))
                  .map((x) => (
                    <a href={safeUrl(x.url)} key={x.id} target="_blank" rel="noopener noreferrer">
                      {x.name} ↗
                    </a>
                  ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
      <Related links={[['Services', '/services'], ['Work', '/work'], ['About', '/about']]} />
    </>
  );
}
