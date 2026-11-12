'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { useRef } from 'react';

/** Scroll-reveal wrapper: fades + slides up on entry. Respects reduced motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Hero entrance item: sequenced fade/slide on mount. */
export function HeroItem({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Floating geometric shapes for the hero background.
 * Gentle CSS float + scroll parallax (transform/opacity only).
 * Decorative only — hidden from assistive tech.
 */
export function FloatingShapes() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  if (reduce) {
    return (
      <div ref={ref} className="floating-shapes" aria-hidden="true">
        <span className="shape shape-circle" />
        <span className="shape shape-arc" />
        <span className="shape shape-diagonal" />
        <span className="shape shape-dot" />
      </div>
    );
  }
  return (
    <div ref={ref} className="floating-shapes" aria-hidden="true">
      <motion.span className="shape shape-circle float-a" style={{ y: ySlow, opacity }} />
      <motion.span className="shape shape-arc float-b" style={{ y: yFast, opacity }} />
      <motion.span className="shape shape-diagonal float-c" style={{ y: ySlow, opacity }} />
      <motion.span className="shape shape-dot float-a" style={{ y: yFast, opacity }} />
    </div>
  );
}
