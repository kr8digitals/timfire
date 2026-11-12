'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Lock, MessageCircle, Mail, Code2, Bot, GraduationCap, Sparkles, PenLine, Users, BookOpen } from 'lucide-react';
import { isPublished } from '@/lib/content';
import { useStore, safeUrl, safeMedia } from '@/lib/store';
import { Reveal } from '@/components/motion';
import ContactForm from '@/components/contact-form';

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
    title: 'Words, sound',
    accent: 'and space.',
    description: 'Poems, spoken word, music and piano.',
  },
  journal: {
    eyebrow: 'The journal',
    title: 'Ideas in',
    accent: 'progress.',
    description: 'Writing and reflections, shared as they grow.',
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
      <Heading section={section} />
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
      <div className="two-col">
        <Reveal>
          <div className="photo-card">
            <PImage src="/images/founder.webp" alt="TIMFIRE, also known as Kenneth Timothy Iziogo, in a dark suit" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="copy-panel">
            <span className="eyebrow">TIMFIRE</span>
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
            <Link href="/timeline" className="text-link">
              Explore the timeline <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </div>

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
  return (
    <>
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
              Need an AI agent of <em>your own?</em>
            </h2>
          </div>
          <Link href={'/contact?service=' + encodeURIComponent('AI agent development')} className="button primary">
            Request one <ArrowUpRight size={18} />
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
      <div className="two-col">
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">Founder · KR8 DIGITALS</span>
            <h2>
              We create.
              <br />
              <em>We innovate.</em>
              <br />
              We deliver results.
            </h2>
            <p>
              KR8 DIGITALS is a creative company: fast websites, unforgettable brand identities, video, AI systems and
              search authority for organisations ready to lead — alongside free training for the next generation of
              digital builders.
            </p>
            <p>
              <strong>THINK IT. KR8 IT.</strong>
            </p>
            <a href="https://kr8digitals.com" className="text-link" target="_blank" rel="noopener noreferrer">
              Visit KR8 DIGITALS <ArrowUpRight size={18} />
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card">
            <PImage src="/images/supplied-founder.webp" alt="TIMFIRE standing in a white shirt and brown trousers" width={1023} height={1537} />
          </div>
        </Reveal>
      </div>

      <Reveal>
        <blockquote className="quote-panel">
          <p>“Whoever you are, whatever you do, we exist because of you.”</p>
          <footer>The KR8 DIGITALS promise</footer>
        </blockquote>
      </Reveal>

      <Reveal>
        <div className="sectionhead section">
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

const symbols: Record<string, string> = {
  USD: 'US dollar',
  NGN: 'Nigerian naira',
  EUR: 'Euro',
  GBP: 'British pound',
  CAD: 'Canadian dollar',
  AUD: 'Australian dollar',
  GHS: 'Ghanaian cedi',
  ZAR: 'South African rand',
  KES: 'Kenyan shilling',
  INR: 'Indian rupee',
};

function detectCurrency() {
  try {
    const locale = new Intl.Locale(navigator.language);
    const region = locale.region || '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region === 'NG' || tz === 'Africa/Lagos') return 'NGN';
    return (
      ({ GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', GH: 'GHS', ZA: 'ZAR', KE: 'KES', IN: 'INR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', IE: 'EUR', NL: 'EUR' } as Record<string, string>)[region] || 'USD'
    );
  } catch {
    return 'USD';
  }
}

function Services() {
  const { data } = useStore();
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>(data.settings.rates);

  useEffect(() => {
    setCurrency(detectCurrency());
    try {
      const saved = localStorage.getItem('timfire-rate-cache');
      if (saved) {
        const v = JSON.parse(saved);
        if (Date.now() - v.time < 86400000) setRates({ ...data.settings.rates, ...v.rates });
      }
    } catch {
      /* ignore */
    }
    fetch('https://api.frankfurter.app/latest?from=USD')
      .then((r) => {
        if (!r.ok) throw Error('exchange service failed');
        return r.json();
      })
      .then((v) => {
        if (v.rates && typeof v.rates === 'object') {
          setRates({ ...data.settings.rates, ...v.rates, USD: 1 });
          localStorage.setItem('timfire-rate-cache', JSON.stringify({ time: Date.now(), rates: v.rates }));
        }
      })
      .catch(() => {});
  }, [data.settings.rates]);

  const usable = currency === 'NGN' || currency === 'USD' || (Number.isFinite(rates[currency]) && rates[currency] > 0);
  const chosen = usable ? currency : 'USD';

  return (
    <>
      <Reveal>
        <div className="sectionhead">
          <div>
            <label htmlFor="currency" className="form-label">
              Display currency
            </label>
            <select className="price-select" id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.entries(symbols).map(([code, name]) => (
                <option value={code} key={code}>
                  {code} — {name}
                </option>
              ))}
            </select>
            {!usable && <p className="muted">Conversion unavailable; showing USD.</p>}
          </div>
          <p>Optional monthly maintenance is extra. Prices are starting points and depend on your requirements.</p>
        </div>
      </Reveal>
      <div className="page-grid">
        {data.services
          .filter((x) => x.enabled)
          .map((x, i) => {
            const amount = chosen === 'NGN' ? x.ngn : x.usd === null ? null : x.usd * (rates[chosen] || 1);
            return (
              <Reveal key={x.id} delay={Math.min(i * 0.05, 0.3)}>
                <article className="card" id={x.id}>
                  <h3>{x.name}</h3>
                  <p className="price">
                    {amount === null ? (
                      'Request a quote'
                    ) : (
                      <>
                        From{' '}
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: chosen, currencyDisplay: 'narrowSymbol', maximumFractionDigits: chosen === 'NGN' ? 0 : 2 }).format(amount)}
                        {x.unit === 'hour' ? ' / hour' : ''}
                      </>
                    )}
                  </p>
                  <p className="muted">{x.note}</p>
                  <Link className="text-link" href={'/contact?service=' + encodeURIComponent(x.name)}>
                    Get in touch <ArrowUpRight size={18} />
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
            <Link className="text-link" href={'/contact?service=' + encodeURIComponent('One-on-one mentorship')}>
              Book a session <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </Reveal>

      <Related links={[['Selected work', '/work'], ['Contact', '/contact']]} />
    </>
  );
}

function Creative() {
  return (
    <>
      <div className="two-col">
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">Poetry · spoken word · music</span>
            <h2>
              A place for <em>expression.</em>
            </h2>
            <p>
              Not everything worth making is a website. This is where the poems, spoken word pieces and piano live — the
              quieter half of the same practice.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card creative-photo">
            <PImage src="/images/writing.webp" alt="TIMFIRE smiling with an open book on his lap" width={1280} height={1920} />
          </div>
        </Reveal>
      </div>
      <div className="section">
        <CreativeList />
      </div>
      <section className="two-col section">
        <Reveal>
          <div className="photo-card creative-photo">
            <PImage src="/images/music-studio.webp" alt="TIMFIRE standing in a music studio beneath a MUSIC sign" width={1402} height={1920} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="copy-panel">
            <span className="eyebrow">Music · piano</span>
            <h2>
              Another way to <em>express.</em>
            </h2>
            <p>Music and piano are part of this creative space. Work will be shared here as it is ready.</p>
          </div>
        </Reveal>
      </section>
      <Related links={[['Journal', '/journal'], ['About', '/about'], ['Now', '/now']]} />
    </>
  );
}

function CreativeList() {
  const { data } = useStore();
  const items = data.creative.filter(isPublished);
  if (!items.length) {
    return (
      <>
        <h2>
          Creative <em>work.</em>
        </h2>
        <p className="muted" style={{ maxWidth: 640 }}>
          The space is being prepared. Each card below is a placeholder for work that will be published here.
        </p>
        <div className="page-grid" style={{ marginTop: 24 }}>
          {['[ADD: poem 1]', '[ADD: poem 2]', '[ADD: poem 3]', '[ADD: spoken word]', '[ADD: music or piano]'].map((x) => (
            <div className="card" key={x}>
              {x}
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <h2>
        Creative <em>work.</em>
      </h2>
      <div className="page-grid" style={{ marginTop: 24 }}>
        {items.map((x) => (
          <article className="card light" key={x.id}>
            <span className="badge">{x.category}</span>
            <h3>{x.title}</h3>
            <Link className="text-link" style={{ color: '#842e00' }} href={'/creative/' + encodeURIComponent(x.slug)}>
              Explore <ArrowUpRight size={18} />
            </Link>
          </article>
        ))}
      </div>
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
        <p className="muted" style={{ maxWidth: 640 }}>
          Notes on building, learning and the work behind the work. Articles are published here as they are finished.
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
          {items.length ? 'No articles match your search.' : 'Articles coming soon. [ADD: first journal article]'}
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
