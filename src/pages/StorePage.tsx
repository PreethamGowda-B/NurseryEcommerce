import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/navigation/Navbar';
import { BotanicalScene } from '../components/BotanicalScene';
import { HeroOverlay } from '../components/hero/HeroOverlay';
import { CinematicOverlayText } from '../components/CinematicOverlayText';
import { VideoTransitionSection } from '../components/VideoTransitionSection';
import { PlantCatalogSection } from '../components/plants/PlantCatalogSection';
import { WhySheeneeka } from '../components/about/WhySheeneeka';
import { NurseryGallery } from '../components/gallery/NurseryGallery';
import { VisitUsSection } from '../components/contact/VisitUsSection';
import { FinalCTA } from '../components/footer/FinalCTA';

gsap.registerPlugin(ScrollTrigger);

export const StorePage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const scrollSpaceRef = useRef<HTMLDivElement>(null!);
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: scrollSpaceRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // FPS Monitor for Dev mode
  useEffect(() => {
    if (!(import.meta as any).env?.DEV) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const calcFps = () => {
      frameCount++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };

    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full bg-[#faf9f6] text-[#0f2d21] font-sans">
      
      {/* Navbar Header */}
      <Navbar />

      {/* Full-Screen WebGL 3D Botanical Scene */}
      <div
        style={{
          opacity: scrollProgress < 0.08 ? 0 : Math.min(1, (scrollProgress - 0.08) * 10),
          transition: 'opacity 0.3s ease',
          pointerEvents: scrollProgress < 0.08 ? 'none' : 'auto',
        }}
      >
        <BotanicalScene scrollProgress={scrollProgress} />
      </div>

      {/* Hero Initial Overlay */}
      <HeroOverlay scrollProgress={scrollProgress} />

      {/* Cinematic Text Overlay Chapters */}
      <CinematicOverlayText scrollProgress={scrollProgress} />

      {/* 3D-to-Video Transition Section */}
      <VideoTransitionSection scrollProgress={scrollProgress} />

      {/* HUD Badge (Dev Only) */}
      {(import.meta as any).env?.DEV && (
        <div className="fixed bottom-4 left-4 z-30 pointer-events-auto hidden xl:flex items-center gap-3 bg-white/95 backdrop-blur-md border border-emerald-900/10 px-3.5 py-2 rounded-full text-xs shadow-natural text-[#0f2d21]">
          <div className="flex items-center gap-1.5 font-mono text-[#386641] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#386641] animate-ping" />
            <span>{fps} FPS</span>
          </div>
          <div className="h-3 w-px bg-emerald-900/10" />
          <span className="text-[11px] font-mono text-slate-500">
            Scroll: {(scrollProgress * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* 500vh Virtual Scroll Space */}
      <div ref={scrollSpaceRef} className="relative w-full h-[500vh] pointer-events-none" />

      {/* Main Website Sections */}
      <div className="relative z-30 bg-[#faf9f6]">
        <PlantCatalogSection />
        <WhySheeneeka />
        <NurseryGallery />
        <VisitUsSection />
        <FinalCTA />
      </div>

    </div>
  );
};
