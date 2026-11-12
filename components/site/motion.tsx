'use client';
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.68, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger a list of children on scroll. */
export function Stagger({
  children,
  className,
  gap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hero entrance.
 *
 * Uses a CSS keyframe (not an inline opacity:0) so the headline is painted on
 * the first frame. That keeps the LCP element visible immediately, works with
 * JavaScript disabled, and still animates in for everyone else. The animation
 * itself is disabled by the reduced-motion media query in globals.css.
 */
export function HeroItem({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`rise${className ? ` ${className}` : ''}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

/** Slow parallax drift for hero artwork. Disabled for reduced motion. */
export function ParallaxLite({ children, strength = 26 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, strength]), { stiffness: 90, damping: 20 });
  if (reduce) return <div ref={ref}>{children}</div>;
  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Decorative hero background: drifting light, slow orbital rings and a fine
 * dot mesh. Purely presentational (aria-hidden) and cheap — CSS animation only,
 * so it does not take part in the frame budget of the foreground.
 */
export function HeroBackdrop() {
  return (
    <div className="hero-canvas" aria-hidden="true">
      <span className="hero-glow a" />
      <span className="hero-glow b" />
      <span className="hero-mesh" />
      <span className="hero-arc a" />
      <span className="hero-arc b" />
      <span className="hero-node" style={{ left: '46%', top: '18%' }} />
      <span className="hero-node" style={{ left: '62%', top: '64%', width: 4, height: 4 }} />
      <span className="hero-node" style={{ left: '12%', top: '72%', width: 5, height: 5 }} />
    </div>
  );
}

/** Reading progress bar for long-form pages. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--orange)',
        scaleX: width,
        transformOrigin: '0 50%',
        zIndex: 60,
      }}
    />
  );
}
