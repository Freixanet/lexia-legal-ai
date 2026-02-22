'use client';

import { lazy, Suspense } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Demo } from './Demo';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { UseCases } from './UseCases';
import { SocialProof } from './SocialProof';
import { Pricing } from './Pricing';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import './LandingV3.css';

const LazySocialProof = lazy(() => Promise.resolve({ default: SocialProof }));
const LazyPricing = lazy(() => Promise.resolve({ default: Pricing }));
const LazyFAQ = lazy(() => Promise.resolve({ default: FAQ }));
const LazyFinalCTA = lazy(() => Promise.resolve({ default: FinalCTA }));
const LazyFooter = lazy(() => Promise.resolve({ default: Footer }));

function SectionSkeleton() {
  return <div className="landing-v3-section" style={{ minHeight: 200, background: 'var(--color-bg-secondary)' }} />;
}

/**
 * Landing completa v3: Hero, Demo, Features, HowItWorks, UseCases,
 * SocialProof, Pricing, FAQ, FinalCTA, Footer.
 * Navbar transparente que se vuelve sólida al hacer scroll.
 */
export function LandingV3() {
  return (
    <div className="landing-v3">
      <Navbar />
      <Hero />
      <Demo />
      <Features />
      <HowItWorks />
      <UseCases />
      <Suspense fallback={<SectionSkeleton />}>
        <LazySocialProof />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <LazyPricing />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <LazyFAQ />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <LazyFinalCTA />
      </Suspense>
      <Suspense fallback={null}>
        <LazyFooter />
      </Suspense>
    </div>
  );
}
