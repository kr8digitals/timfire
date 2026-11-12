'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  PenLine,
  Bot,
  GraduationCap,
  Music2,
  Mic2,
  Feather,
  Presentation,
  Search,
  Palette,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Reveal, HeroItem, FloatingShapes } from '@/components/motion';
import HeroScenes from '@/components/scenes';

export default function Home() {
  const { data } = useStore();
  return (
    <main id="main">
      <section className="hero">
        <HeroScenes />
        <FloatingShapes />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <HeroItem delay={0}>
              <span className="hero-intro">{data.profile.heroWelcome}</span>
            </HeroItem>
            <HeroItem delay={0.15}>
              <h1>{data.profile.heroLine}</h1>
            </HeroItem>
            <HeroItem delay={0.5}>
              <p className="hero-name">
                {data.profile.heroName.includes('Timfire') ? (
                  <>
                    {data.profile.heroName.split('Timfire')[0]}
                    <em>Timfire{data.profile.heroName.split('Timfire')[1]}</em>
                  </>
                ) : (
                  data.profile.heroName
                )}
              </p>
            </HeroItem>
            <HeroItem delay={0.7}>
              <p className="hero-lead">
                Websites and AI agents built to work — fast on the phone in your hand, clear on the first screen.
                And when the laptop closes: poetry, spoken word, music and piano.
              </p>
            </HeroItem>
            <HeroItem delay={0.9}>
              <div className="actions">
                <Link href="/work" className="button primary">
                  See the work <ArrowUpRight size={18} />
                </Link>
                <Link href="/contact" className="button ghost">
                  Work with me <ArrowUpRight size={18} />
                </Link>
              </div>
            </HeroItem>
          </div>
          <div className="hero-art">
            <div className="hero-panel" aria-hidden="true" />
            <div className="hero-circle" aria-hidden="true" />
            <Image
              src="/images/hero.webp"
              alt="TIMFIRE smiling in a burnt-orange jacket and white shirt"
              width={1300}
              height={1226}
              priority
              fetchPriority="high"
              sizes="(max-width: 800px) 95vw, 50vw"
            />
          </div>
          <a className="scroll-cue" href="#behind">
            <ArrowDown size={17} className="scroll-cue-icon" /> Scroll to explore
          </a>
        </div>
      </section>

      {/* A — Behind the work (preserved) */}
      <section id="behind" className="shell section two-col">
        <Reveal>
          <div className="photo-card">
            <Image
              src="/images/supplied-about.webp"
              alt="TIMFIRE seated in a cream shirt and brown trousers"
              width={1229}
              height={1536}
              sizes="(max-width: 800px) 90vw, 42vw"
              loading="lazy"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="copy-panel">
            <span className="eyebrow">Behind the work</span>
            <h2>
              More than one <em>way to create.</em>
            </h2>
            <p>{data.profile.intro}</p>
            <p>{data.profile.about}</p>
            <p>
              My name is Kenneth Timothy Iziogo. I study Linguistics at Ebonyi State University, which turns out to be
              an unusual advantage: websites fail on language long before they fail on code.
            </p>
            <Link className="text-link" href="/about">
              More about me <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* B — What I build, with real proof */}
      <section className="shell section">
        <Reveal>
          <div className="sectionhead">
            <div>
              <span className="eyebrow">What I build</span>
              <h2>
                Websites and agents, <em>built to work.</em>
              </h2>
            </div>
            <p>Not brochures. Tools with a job: take the enquiry, answer the question, do the repetitive work.</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="page-lead" style={{ maxWidth: 720 }}>
            A website is the employee that never sleeps — it shows the proof and takes the message at 2am on a slow
            connection. An AI agent is the same discipline pointed inward: grounded in your real prices, your real
            process and your real refusals, so it handles the repetitive work without inventing anything.
          </p>
        </Reveal>
        <div className="proof-grid">
          <Reveal delay={0.08}>
            <Link href="/work#afristem" className="proof-card">
              <Image
                src="/images/afristem-site.webp"
                alt="Screenshot of the AFRISTEM Global website homepage"
                width={730}
                height={375}
                sizes="(max-width: 800px) 90vw, 30vw"
                loading="lazy"
              />
              <span className="proof-meta">
                <strong>AFRISTEM Global</strong>
                <span>Website · STEM education &amp; competitions</span>
              </span>
              <ArrowUpRight className="corner" size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.14}>
            <Link href="/work#kr8" className="proof-card">
              <Image
                src="/images/kr8-site.webp"
                alt="Screenshot of the KR8 DIGITALS website homepage"
                width={1340}
                height={625}
                sizes="(max-width: 800px) 90vw, 30vw"
                loading="lazy"
              />
              <span className="proof-meta">
                <strong>KR8 DIGITALS</strong>
                <span>Website · studio, academy &amp; tribe</span>
              </span>
              <ArrowUpRight className="corner" size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/work#riya" className="proof-card tint">
              <span className="icon-badge">
                <Bot size={22} />
              </span>
              <span className="proof-meta">
                <strong>RIYA</strong>
                <span>AI agent · live on kr8digitals.com</span>
              </span>
              <ArrowUpRight className="corner" size={18} />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="actions">
            <Link href="/work" className="button primary">
              See the work <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* C — Services introduction */}
      <section className="shell section">
        <Reveal>
          <div className="sectionhead">
            <div>
              <span className="eyebrow">How I can help</span>
              <h2>
                Services that <em>pay for themselves.</em>
              </h2>
            </div>
            <p>Each one exists because a business had a problem with a price tag on it.</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="page-lead" style={{ maxWidth: 720 }}>
            No website, so no enquiries. A site that loads slowly, so visitors leave. Invisible on Google, so the
            competition takes the call. A brand that looks smaller than what it charges. These are fixable problems,
            and I fix the specific one you have — quoted in writing first, handed over in your name at the end.
          </p>
        </Reveal>
        <div className="svc-rows">
          <Reveal delay={0.06}>
            <Link href="/services#website" className="svc-row">
              <span className="icon-badge small">
                <Code2 size={18} />
              </span>
              <span className="svc-copy">
                <strong>Website design &amp; development</strong>
                <span>A fast site built around the one thing a visitor should do next.</span>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/services#ai" className="svc-row">
              <span className="icon-badge small">
                <Bot size={18} />
              </span>
              <span className="svc-copy">
                <strong>AI agent development</strong>
                <span>An assistant grounded in your real process — not a chatbot guessing.</span>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.14}>
            <Link href="/services#seo" className="svc-row">
              <span className="icon-badge small">
                <Search size={18} />
              </span>
              <span className="svc-copy">
                <strong>SEO optimisation</strong>
                <span>Be the answer when someone searches for what you sell.</span>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.18}>
            <Link href="/services#branding" className="svc-row">
              <span className="icon-badge small">
                <Palette size={18} />
              </span>
              <span className="svc-copy">
                <strong>Branding &amp; graphic design</strong>
                <span>Look like what you charge, on every surface at once.</span>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="actions">
            <Link href="/services" className="button ghost">
              All services &amp; pricing <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* D — Creative identity */}
      <section className="shell section">
        <div className="two-col wide-copy">
          <Reveal>
            <div className="copy-panel">
              <span className="eyebrow">Beyond the screen</span>
              <h2>
                The same hands, <em>other instruments.</em>
              </h2>
              <p>
                Code is not the only thing I make. I write poetry and spoken word, sing and write my own music, play
                piano and keyboard, and speak in front of rooms when there is something worth saying.
              </p>
              <p>
                This is not a hobby shelf. The ear for rhythm and plain language that makes a webpage readable was
                built writing verses and standing on stages — the creative work and the technical work feed each other.
              </p>
              <div className="chip-row">
                <Link href="/creative" className="chip">
                  <Music2 size={15} /> Music &amp; piano
                </Link>
                <Link href="/creative" className="chip">
                  <Mic2 size={15} /> Spoken word
                </Link>
                <Link href="/creative" className="chip">
                  <Feather size={15} /> Poetry
                </Link>
                <Link href="/creative" className="chip">
                  <Presentation size={15} /> Public speaking
                </Link>
              </div>
              <Link className="text-link" href="/creative">
                Enter the creative space <ArrowUpRight size={18} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="photo-card creative-photo">
              <Image
                src="/images/creative/speaking.webp"
                alt="TIMFIRE speaking with a microphone in hand"
                width={900}
                height={1200}
                sizes="(max-width: 800px) 90vw, 42vw"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ventures */}
      <section className="shell section">
        <div className="two-col">
          <Reveal>
            <div className="copy-panel">
              <span className="eyebrow">Ventures</span>
              <h2>
                KR8 DIGITALS, and <em>what it pays for.</em>
              </h2>
              <p>
                I founded KR8 DIGITALS to do client work properly — websites, branding, video, SEO and AI agents under
                one roof — and to spend the profit on KR8 Academy: eight-week, tuition-free digital skills cohorts with
                a verifiable graduate ID at the end.
              </p>
              <p>
                Graduates join the KR8 Tribe, a community of 3,000+ creators. Nobody pays tuition. The client work pays
                for it.
              </p>
              <div className="role-list">
                <span className="badge">
                  <GraduationCap size={15} /> Founder &amp; CEO, KR8 DIGITALS
                </span>
                <span className="badge">
                  <PenLine size={15} /> KR8 Academy · tuition-free
                </span>
              </div>
              <Link className="text-link" href="/ventures">
                Inside KR8 <ArrowUpRight size={18} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="photo-card">
              <Image
                src="/images/ventures/kr8-founder.webp"
                alt="TIMFIRE, founder of KR8 DIGITALS, in a brown suit"
                width={1000}
                height={1400}
                sizes="(max-width: 800px) 90vw, 42vw"
                loading="lazy"
                style={{ objectPosition: 'center 12%' }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {data.testimonials.some((x) => x.isPublic) && (
        <section className="shell section">
          <Reveal>
            <span className="eyebrow">Kind words</span>
            <h2>
              What people <em>say.</em>
            </h2>
            <div className="page-grid" style={{ marginTop: 24 }}>
              {data.testimonials
                .filter((x) => x.isPublic)
                .map((x) => (
                  <blockquote className="card" key={x.id}>
                    <p className="prose">“{x.quote}”</p>
                    <footer>{x.name}</footer>
                  </blockquote>
                ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* E — closing CTA (preserved direction) */}
      <section className="shell section">
        <Reveal>
          <div className="cta-block">
            <div>
              <span className="eyebrow">Let&apos;s make something real</span>
              <h2>
                Let&apos;s make it <em>real.</em>
              </h2>
              <p className="muted" style={{ marginTop: 12, maxWidth: 460 }}>
                Tell me what you are trying to build. I will tell you honestly whether I am the right person for it,
                and roughly what it will take.
              </p>
            </div>
            <Link href="/contact" className="button primary">
              Work with me <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
