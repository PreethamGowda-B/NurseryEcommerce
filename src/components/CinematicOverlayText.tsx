import React from 'react';
import { Leaf, ArrowRight } from 'lucide-react';

interface CinematicOverlayTextProps {
  scrollProgress: number;
}

interface ChapterConfig {
  start: number;
  end: number;
  num: string;
  title: string[];       // split so we can style alternating words
  subtitle: string;
  body: string;
  align: 'left' | 'right' | 'center';
  accentColor: string;
}

const CHAPTERS: ChapterConfig[] = [
  {
    start: 0.12, end: 0.35,
    num: '01',
    title: ['Where', 'Nature Begins'],
    subtitle: 'THE ROOTS OF EVERYTHING',
    body: 'Every garden begins with a single living idea. From healthy seedlings to full vibrant canopies, we cultivate life with passion and purpose.',
    align: 'left',
    accentColor: '#52b788',
  },
  {
    start: 0.35, end: 0.60,
    num: '02',
    title: ['Raised With', 'Care & Patience'],
    subtitle: 'NURTURED BY EXPERTS',
    body: 'Cultivated in optimal soil blends and natural morning sunlight — every plant we grow transforms your living space effortlessly.',
    align: 'right',
    accentColor: '#95d5b2',
  },
  {
    start: 0.60, end: 0.80,
    num: '03',
    title: ['Every Leaf', 'Has A Story'],
    subtitle: 'FROM OUR NURSERY, TO YOUR WORLD',
    body: 'Bringing life, character, and freshness straight from our botanical nursery into your home, garden, and every cherished space.',
    align: 'center',
    accentColor: '#b7e4c7',
  },
];

function getChapterOpacity(p: number, start: number, end: number): number {
  if (p < start || p > end) return 0;
  const norm = (p - start) / (end - start);
  return Math.sin(norm * Math.PI);
}

export const CinematicOverlayText: React.FC<CinematicOverlayTextProps> = ({ scrollProgress }) => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-20">
      {CHAPTERS.map((ch) => {
        const opacity = getChapterOpacity(scrollProgress, ch.start, ch.end);
        if (opacity <= 0.01) return null;

        const norm = (scrollProgress - ch.start) / (ch.end - ch.start);
        // Slide translation — comes in from bottom, goes out upward
        const slideY = norm < 0.5
          ? (1 - norm * 2) * 28        // entering: slide up from +28
          : ((norm - 0.5) * 2) * -20;  // leaving: slide up off-screen

        const isLeft   = ch.align === 'left';
        const isRight  = ch.align === 'right';
        const isCenter = ch.align === 'center';

        return (
          <div
            key={ch.num}
            className="absolute inset-0 flex items-center"
            style={{ opacity }}
          >
            {/* Full-screen dark botanical overlay */}
            <div
              className="absolute inset-0 chapter-overlay"
              style={{ opacity: Math.min(opacity, 0.88) }}
            />

            {/* Decorative background number */}
            <span
              className="absolute font-cinzel font-black text-white/[0.04] select-none pointer-events-none"
              style={{
                fontSize: 'clamp(160px, 30vw, 340px)',
                right: isLeft ? 'auto' : isRight ? '-2%' : '50%',
                left: isLeft ? '-2%' : isRight ? 'auto' : 'auto',
                transform: isCenter ? 'translateX(50%)' : undefined,
                bottom: '-5%',
                lineHeight: 1,
              }}
            >
              {ch.num}
            </span>

            {/* Chapter Card */}
            <div
              className={`relative z-10 w-full px-5 sm:px-10 lg:px-20 xl:px-28
                         flex ${isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center'}`}
              style={{ transform: `translateY(${slideY}px)`, willChange: 'transform' }}
            >
              <div
                className={`max-w-xl w-full ${isCenter ? 'text-center' : 'text-left'}`}
                style={{ pointerEvents: 'auto' }}
              >
                {/* Chapter badge */}
                <div
                  className={`inline-flex items-center gap-2 mb-5
                             ${isCenter ? 'mx-auto' : ''}`}
                >
                  <div className="w-8 h-px" style={{ background: ch.accentColor }} />
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-[0.3em]"
                    style={{ color: ch.accentColor }}
                  >
                    CHAPTER {ch.num} — {ch.subtitle}
                  </span>
                  <div className="w-8 h-px" style={{ background: ch.accentColor }} />
                </div>

                {/* Big Headline */}
                <h2
                  className="font-cinzel font-black leading-none mb-4"
                  style={{ fontSize: 'clamp(1.8rem, 5.5vw, 5rem)' }}
                >
                  <span className="block text-white">{ch.title[0]}</span>
                  <span className="block italic font-playfair font-bold" style={{ color: ch.accentColor }}>
                    {ch.title[1]}
                  </span>
                </h2>

                {/* Body */}
                <p className="text-white/75 text-sm sm:text-base font-light leading-relaxed mb-7 max-w-md">
                  {ch.body}
                </p>

                {/* Progress dots */}
                <div className={`flex items-center gap-2 ${isCenter ? 'justify-center' : ''}`}>
                  {CHAPTERS.map((c) => (
                    <div
                      key={c.num}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: c.num === ch.num ? 24 : 6,
                        height: 6,
                        background: c.num === ch.num ? ch.accentColor : 'rgba(255,255,255,0.25)',
                      }}
                    />
                  ))}
                  <span className="text-white/40 text-[10px] font-mono ml-2">
                    {ch.num} / 03
                  </span>
                </div>

              </div>
            </div>

            {/* Bottom edge glow line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${ch.accentColor}66, transparent)`,
                opacity,
              }}
            />

          </div>
        );
      })}
    </div>
  );
};
