import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

interface VideoTransitionSectionProps {
  scrollProgress: number;
}

// Real Unsplash nursery scenes — used as CSS backgrounds (no CORS issue)
const NURSERY_SCENES = [
  {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=90',
    alt: 'Lush nursery plant rows',
  },
  {
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4aaae?auto=format&fit=crop&w=1600&q=90',
    alt: 'Potted tropical plants',
  },
  {
    url: 'https://images.unsplash.com/photo-1530968033775-2c92736b131e?auto=format&fit=crop&w=1600&q=90',
    alt: 'Garden center walkway',
  },
  {
    url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1600&q=90',
    alt: 'Bright sunlit greenhouse',
  },
];

export const VideoTransitionSection: React.FC<VideoTransitionSectionProps> = ({ scrollProgress }) => {
  const [activeScene, setActiveScene] = useState(0);
  const [nextScene, setNextScene] = useState(1);
  const [blendOpacity, setBlendOpacity] = useState(0);

  // Chapter 05 visibility: 80% → 97%
  let sectionOpacity = 0;
  if (scrollProgress >= 0.80 && scrollProgress <= 0.95) {
    sectionOpacity = Math.min(1, (scrollProgress - 0.80) / 0.06);
  } else if (scrollProgress > 0.95) {
    sectionOpacity = Math.max(0, 1 - (scrollProgress - 0.95) / 0.05);
  }

  // Derive scene from scroll — each scene spans 25% of chapter progress
  useEffect(() => {
    if (sectionOpacity <= 0.01) return;
    const chapterP = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.17));
    const sceneF = chapterP * (NURSERY_SCENES.length - 1);
    const currentSceneIdx = Math.min(Math.floor(sceneF), NURSERY_SCENES.length - 2);
    const intraP = sceneF - currentSceneIdx; // 0 → 1 within this scene transition

    setActiveScene(currentSceneIdx);
    setNextScene(Math.min(currentSceneIdx + 1, NURSERY_SCENES.length - 1));
    setBlendOpacity(intraP);
  }, [scrollProgress, sectionOpacity]);

  if (sectionOpacity <= 0.01) return null;

  const chapterP = Math.max(0, Math.min(1, (scrollProgress - 0.80) / 0.17));

  // Ken Burns pan values for current scene (CSS transform)
  const kbScale = 1 + chapterP * 0.06;
  const kbTranslateX = -chapterP * 2; // slight left pan

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{ opacity: sectionOpacity, transition: 'opacity 0.5s ease' }}
    >

      {/* ── SCENE A — current ── */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-none"
        style={{
          backgroundImage: `url(${NURSERY_SCENES[activeScene].url})`,
          transform: `scale(${kbScale}) translateX(${kbTranslateX}%)`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />

      {/* ── SCENE B — next (cross-fades in) ── */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-none"
        style={{
          backgroundImage: `url(${NURSERY_SCENES[nextScene].url})`,
          opacity: blendOpacity,
          transform: `scale(${1 + (1 - chapterP) * 0.04}) translateX(${(1 - chapterP) * -1}%)`,
          transformOrigin: 'center center',
          willChange: 'transform, opacity',
        }}
      />

      {/* ── VIGNETTE overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(15,45,33,0.55) 100%)',
        }}
      />

      {/* ── TOP fade ── */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#faf9f6] to-transparent pointer-events-none" />

      {/* ── BOTTOM fade to cream ── */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#faf9f6] to-transparent pointer-events-none" />

      {/* ── Progress bar ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 pointer-events-none z-20">
        <div
          className="h-full bg-gradient-to-r from-[#52b788] to-[#95d5b2]"
          style={{ width: `${chapterP * 100}%`, transition: 'width 0.3s ease' }}
        />
      </div>

      {/* ── Chapter label — top left ── */}
      <div className="absolute top-20 left-8 sm:left-16 pointer-events-none z-20">
        <div className="flex items-center gap-2 text-white/80 text-[10px] font-mono font-bold uppercase tracking-[0.28em]">
          <div className="w-6 h-px bg-[#52b788]" />
          <span>Chapter 04 — From Our Nursery to Your Space</span>
        </div>
      </div>

      {/* ── Giant scene number — top right ── */}
      <div className="absolute top-14 right-8 sm:right-14 pointer-events-none z-20">
        <span
          className="font-cinzel font-black text-white/20 select-none leading-none"
          style={{ fontSize: 'clamp(4rem, 8vw, 8rem)' }}
        >
          04
        </span>
      </div>

      {/* ── Info card — bottom left ── */}
      <div
        className="absolute bottom-10 left-6 right-6 md:left-14 md:right-auto md:max-w-md pointer-events-auto z-20"
        style={{
          transform: `translateY(${(1 - Math.min(1, sectionOpacity * 2)) * 24}px)`,
          transition: 'transform 0.4s ease',
        }}
      >
        <div
          className="rounded-2xl p-6 md:p-7"
          style={{
            background: 'rgba(250, 249, 246, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 102, 65, 0.12)',
            boxShadow: '0 20px 60px rgba(15,45,33,0.18)',
          }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 text-[#386641] text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
            <Leaf className="w-3.5 h-3.5" />
            <span>Step Into Our Living Sanctuary</span>
          </div>

          {/* Heading */}
          <h3 className="font-cinzel text-xl md:text-2xl text-[#0f2d21] font-bold mb-2 leading-snug">
            From Our Nursery<br />
            <span className="font-playfair font-normal italic text-[#386641]">To Your Space</span>
          </h3>

          <p className="text-[#3a5246] text-sm leading-relaxed mb-4 font-light">
            Walk through our lush nursery rows, hand-pick your perfect plant, and bring home a living piece of nature.
          </p>

          {/* Scene indicator dots */}
          <div className="flex items-center gap-2 mb-4">
            {NURSERY_SCENES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === activeScene ? 26 : 7,
                  height: 7,
                  background: i === activeScene ? '#386641' : '#c8dfc7',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              const el = document.getElementById('plant-catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5
                       bg-[#386641] hover:bg-[#2d5234] text-white
                       text-sm font-semibold rounded-full
                       shadow-[0_4px_20px_rgba(56,102,65,0.3)]
                       hover:shadow-[0_4px_28px_rgba(56,102,65,0.45)]
                       transition-all duration-300 hover:scale-105 group pointer-events-auto"
          >
            <span>Explore Nursery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
};
