'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowDown, Code2, PenLine, Sparkles, Bot, GraduationCap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Reveal, HeroItem, FloatingShapes } from '@/components/motion';

export default function Home() {
  const { data } = useStore();
  return (
    <main id="main">
      <section className="hero">
        <FloatingShapes />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <HeroItem delay={0}>
              <span className="eyebrow">A personal space · TIMFIRE</span>
            </HeroItem>
            <HeroItem delay={0.15}>
              <h1>{data.profile.heroLine}</h1>
            </HeroItem>
            <HeroItem delay={0.5}>
              <p className="hero-welcome">{data.profile.heroWelcome}</p>
            </HeroItem>
            <HeroItem delay={0.85}>
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
            <HeroItem delay={1.15}>
              <div className="actions">
                <Link href="#explore" className="button primary">
                  Explore my world <ArrowUpRight size={18} />
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
          <a className="scroll-cue" href="#explore">
            <ArrowDown size={17} className="scroll-cue-icon" /> Scroll to explore
          </a>
        </div>
      </section>

      <section id="explore" className="shell section">
        <Reveal>
          <div className="sectionhead">
            <div>
              <span className="eyebrow">A few places to begin</span>
              <h2>
                Explore my <em>world.</em>
              </h2>
            </div>
            <p>Websites, ideas, words and the work of building what comes next.</p>
          </div>
        </Reveal>
        <div className="entry-grid">
          <Reveal delay={0.05}>
            <Link href="/work" className="entry light">
              <span className="icon-badge">
                <Code2 size={22} />
              </span>
              <span>
                <h3>Work</h3>
                <p>Websites and AI agents.</p>
              </span>
              <ArrowUpRight className="corner" />
            </Link>
          </Reveal>
          <Reveal delay={0.12}>
            <Link href="/ventures" className="entry wine">
              <span className="icon-badge">
                <Sparkles size={22} />
              </span>
              <span>
                <h3>Ventures</h3>
                <p>KR8 DIGITALS, Academy and Tribe.</p>
              </span>
              <ArrowUpRight className="corner" />
            </Link>
          </Reveal>
          <Reveal delay={0.19}>
            <Link href="/creative" className="entry dark">
              <span className="icon-badge">
                <PenLine size={22} />
              </span>
              <span>
                <h3>Creative</h3>
                <p>Poetry, spoken word, music and piano.</p>
              </span>
              <ArrowUpRight className="corner" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="shell section two-col">
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
            <Link className="text-link" href="/about">
              More about me <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="shell section two-col">
        <Reveal>
          <div className="copy-panel">
            <span className="eyebrow">What I build</span>
            <h2>
              Websites and agents, <em>built to work.</em>
            </h2>
            <p>
              I design and develop fast websites and domain-grounded AI agents — measured by speed, clarity and utility.
              From a first sketch to a live site, every build starts from the outcome backward.
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
            <Link className="text-link" href="/work">
              See the work <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="photo-card">
            <Image
              src="/images/technology.webp"
              alt="TIMFIRE at work with a laptop, building websites and AI agents"
              width={1280}
              height={1600}
              sizes="(max-width: 800px) 90vw, 42vw"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>

      <section className="shell section">
        <Reveal>
          <div className="statline">
            {data.stats
              .filter((x) => x.isPublic)
              .map((x) => (
                <div key={x.id}>
                  <strong>{x.value}</strong>
                  <span>{x.label}</span>
                </div>
              ))}
          </div>
        </Reveal>
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

      <section className="shell section">
        <Reveal>
          <div className="cta-block">
            <div>
              <span className="eyebrow">Have something in mind?</span>
              <h2>
                Let&apos;s make it <em>real.</em>
              </h2>
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
