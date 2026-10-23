'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { MediaImage } from '@/components/media/MediaImage';
import type { Banner } from '@/content/banners';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

interface HeroSlideshowProps {
  banners: Banner[];
  intervalMs?: number;
}

// `auto` follows the motion preference; an explicit choice by the viewer wins afterwards.
type PlayState = 'auto' | 'playing' | 'paused';

const CONTROL_FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

// V-08: owner banners, ~70vh, 5 s autoplay, square progress bars, pause control.
export const HeroSlideshow = ({ banners, intervalMs = 5000 }: HeroSlideshowProps) => {
  const t = useTranslations('hero');
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [playState, setPlayState] = useState<PlayState>('auto');
  // Bumped on resume so the active bar restarts in step with the timer.
  const [cycle, setCycle] = useState(0);

  const playing = playState === 'playing' || (playState === 'auto' && !reducedMotion);
  const count = banners.length;

  useEffect(() => {
    if (!playing || count < 2) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [playing, index, cycle, count, intervalMs]);

  const togglePlaying = () => {
    if (playing) {
      setPlayState('paused');
      return;
    }
    setPlayState('playing');
    setCycle((value) => value + 1);
  };

  const goTo = (target: number) => {
    setIndex(target);
    setCycle((value) => value + 1);
  };

  return (
    <section aria-roledescription="carousel" aria-label={t('label')} className="HeroSlideshow">
      <div className="HeroSlideshow__stage relative h-[70vh] overflow-hidden">
        {banners.map((banner, position) => {
          const active = position === index;
          return (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${position + 1} / ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                'HeroSlideshow__slide absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none',
                active ? 'opacity-100' : 'opacity-0',
              )}
            >
              <div className="HeroSlideshow__desktop hidden h-full md:block">
                <MediaImage
                  src={banner.desktop.src}
                  alt={banner.desktop.alt.vi}
                  width={banner.desktop.width}
                  height={banner.desktop.height}
                  preload={position === 0}
                  fill
                />
              </div>
              <div className="HeroSlideshow__mobile h-full md:hidden">
                <MediaImage
                  src={banner.mobile.src}
                  alt={banner.mobile.alt.vi}
                  width={banner.mobile.width}
                  height={banner.mobile.height}
                  preload={position === 0}
                  fill
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption-like row under the image: ink on canvas reads on any banner (DR-2). */}
      <div className="HeroSlideshow__controls text-ink flex items-center gap-4 px-4 md:px-8">
        <ol className="HeroSlideshow__bars flex flex-1 gap-2">
          {banners.map((banner, position) => {
            const active = position === index;
            const filled = position < index || (active && !playing);
            return (
              <li key={banner.id} className="flex-1">
                <button
                  type="button"
                  aria-label={t('slide', { index: position + 1, count })}
                  aria-current={active}
                  onClick={() => goTo(position)}
                  className={cn('HeroSlideshow__bar flex h-11 w-full items-center', CONTROL_FOCUS)}
                >
                  <span className="HeroSlideshow__track bg-line relative h-0.5 w-full overflow-hidden">
                    {active && playing ? (
                      <span
                        key={`${index}-${cycle}`}
                        // Runtime duration so the bar matches `intervalMs`.
                        style={{ animationDuration: `${intervalMs}ms` }}
                        className="HeroSlideshow__fill animate-hero-progress bg-ink absolute inset-0 origin-left"
                      />
                    ) : (
                      filled && <span className="HeroSlideshow__fill bg-ink absolute inset-0" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={togglePlaying}
          className={cn(
            'HeroSlideshow__toggle h-11 px-2 text-xs font-medium tracking-wide uppercase',
            CONTROL_FOCUS,
          )}
        >
          {playing ? t('pause') : t('play')}
        </button>
      </div>
    </section>
  );
};
