import '@fontsource/cinzel/500.css';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  patronusSrc: string;
  letterSrc:   string;
  github:   string;
  linkedin: string;
  email:    string;
  name:     string;
  location?: string;
}

type Phase = 'gloom' | 'summoning' | 'gliding' | 'fading' | 'revealed';

const BLOBS = [
  { w: 520, h: 260, top: '10%',  left: '-5%',  dur: 28, delay:    0, opacity: 0.55 },
  { w: 460, h: 220, top: '30%',  left:  '40%', dur: 22, delay:   -6, opacity: 0.45 },
  { w: 580, h: 200, top: '55%',  left: '-10%', dur: 34, delay: -12,  opacity: 0.50 },
  { w: 400, h: 180, top: '70%',  left:  '55%', dur: 26, delay:  -4,  opacity: 0.40 },
  { w: 500, h: 240, top:  '5%',  left:  '60%', dur: 30, delay:  -9,  opacity: 0.48 },
  { w: 360, h: 160, top: '42%',  left:  '20%', dur: 20, delay: -18,  opacity: 0.35 },
] as const;


function getStagSize(containerWidth: number): number {
  if (containerWidth >= 1024) return 280;
  if (containerWidth >= 768)  return 200;
  return 140;
}

export default function PatronusScene({
  patronusSrc, letterSrc, github, linkedin, email, name, location,
}: Props) {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const [phase, setPhase]       = useState<Phase>(prefersReduced ? 'revealed' : 'gloom');
  const [stagSize, setStagSize] = useState(280);

  const containerRef         = useRef<HTMLDivElement>(null);
  const stagRef              = useRef<HTMLImageElement>(null);
  const fogRef               = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const animsRef             = useRef<Animation[]>([]);
  const rafRef               = useRef<number>(0);
  const canvasRef            = useRef<HTMLCanvasElement | null>(null);
  const particlesRef         = useRef<HTMLElement[]>([]);

  const cancelAll = useCallback(() => {
    animsRef.current.forEach(a => a.cancel());
    cancelAnimationFrame(rafRef.current);
    canvasRef.current = null;
    particlesRef.current.forEach(p => p.remove());
    particlesRef.current = [];
  }, []);

  const skipToRevealed = () => { cancelAll(); setPhase('revealed'); };
  const reset          = () => { cancelAll(); setPhase('gloom'); };

  /* ── Main glide loop: path + bob + glow + mask erasure + particles ── */
  const startGlide = useCallback(() => {
    const stag      = stagRef.current;
    const fog       = fogRef.current;
    const container = containerRef.current;
    if (!stag || !fog || !container) return;

    const W    = container.offsetWidth;
    const H    = container.offsetHeight;
    const size = getStagSize(W);
    setStagSize(size);

    /* ── Motion: straight horizontal translateX ── */
    stag.style.left = '0';
    stag.style.top  = `calc(50% - ${size / 2}px)`;

    const startX = -(size + 50);
    const endX   = W + 50;

    const glide = stag.animate(
      [
        { transform: `translateX(${startX}px)`,                  opacity: 0 },
        { transform: `translateX(${startX + size * 1.2}px)`,     opacity: 1, offset: 0.05 },
        { transform: `translateX(${endX   - size * 1.2}px)`,     opacity: 1, offset: 0.95 },
        { transform: `translateX(${endX}px)`,                    opacity: 0 },
      ],
      { duration: 4000, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
        fill: 'forwards', composite: 'replace' },
    );

    const bob = stag.animate(
      [
        { transform: 'translateY(-4px)' },
        { transform: 'translateY( 4px)' },
        { transform: 'translateY(-4px)' },
      ],
      { duration: 1100, iterations: Infinity, easing: 'ease-in-out', composite: 'add' },
    );

    const glow = stag.animate(
      [
        { filter: 'drop-shadow(0 0 32px rgba(63,224,197,0.9)) drop-shadow(0 0 64px rgba(63,224,197,0.5)) drop-shadow(0 0 120px rgba(120,240,220,0.3)) brightness(1.15)' },
        { filter: 'drop-shadow(0 0 48px rgba(63,224,197,1))   drop-shadow(0 0 96px rgba(63,224,197,0.7)) drop-shadow(0 0 160px rgba(120,240,220,0.5)) brightness(1.5)'  },
        { filter: 'drop-shadow(0 0 32px rgba(63,224,197,0.9)) drop-shadow(0 0 64px rgba(63,224,197,0.5)) drop-shadow(0 0 120px rgba(120,240,220,0.3)) brightness(1.15)' },
      ],
      { duration: 2200, iterations: Infinity, easing: 'ease-in-out' },
    );

    animsRef.current = [glide, bob, glow];

    /* ── Canvas mask setup (half-res) ── */
    const cW = Math.max(1, Math.floor(W / 2));
    const cH = Math.max(1, Math.floor(H / 2));
    const canvas = document.createElement('canvas');
    canvas.width  = cW;
    canvas.height = cH;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cW, cH);

    fog.style.maskSize                  = '100% 100%';
    fog.style.maskRepeat                = 'no-repeat';
    (fog.style as any).webkitMaskSize   = '100% 100%';
    (fog.style as any).webkitMaskRepeat = 'no-repeat';

    const initUrl = canvas.toDataURL();
    fog.style.maskImage                  = `url(${initUrl})`;
    (fog.style as any).webkitMaskImage   = `url(${initUrl})`;

    /* ── Particle config ── */
    const maxParticles    = W >= 1024 ? 60 : W >= 768 ? 30 : 15;
    let   lastMaskFrame   = 0;
    let   lastSpawnTime   = 0;
    let   nextSpawnGap    = 60;

    /* ── Combined RAF loop ── */
    function tick(ts: number) {
      const s  = stagRef.current;
      const f  = fogRef.current;
      const c  = containerRef.current;
      const pc = particleContainerRef.current;
      if (!s || !f || !c) { rafRef.current = requestAnimationFrame(tick); return; }

      const sr = s.getBoundingClientRect();
      const cr = c.getBoundingClientRect();

      /* Fog erasure at ~30 fps */
      if (ts - lastMaskFrame >= 33) {
        lastMaskFrame = ts;
        const mx = (sr.left + sr.width  / 2 - cr.left) * 0.5;
        const my = (sr.top  + sr.height / 2 - cr.top)  * 0.5;
        const R  = Math.round(size * 0.35); // erase radius scales with stag size
        const g  = ctx.createRadialGradient(mx, my, 0, mx, my, R);
        g.addColorStop(0,   'rgba(0,0,0,1)');
        g.addColorStop(0.6, 'rgba(0,0,0,1)');
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mx, my, R, 0, Math.PI * 2);
        ctx.fill();
        const url = canvas.toDataURL();
        f.style.maskImage                = `url(${url})`;
        (f.style as any).webkitMaskImage = `url(${url})`;
      }

      /* Particle spawn — only while stag overlaps the visible scene */
      const onScreen = sr.right > cr.left && sr.left < cr.right;
      if (pc && onScreen && ts - lastSpawnTime >= nextSpawnGap) {
        lastSpawnTime  = ts;
        nextSpawnGap   = 40 + Math.random() * 40;

        while (particlesRef.current.length >= maxParticles) {
          particlesRef.current.shift()?.remove();
        }

        const ox = sr.left + sr.width  / 2 - cr.left + (Math.random() - 0.5) * 28;
        const oy = sr.top  + sr.height / 2 - cr.top  + (Math.random() - 0.5) * 28;
        const sz = 2 + Math.random() * 3;
        const col = Math.random() < 0.6 ? '#3FE0C5' : '#6FE8D4';
        const dur = 1500 + Math.random() * 1000;
        const dx  = (Math.random() - 0.5) * 30;
        const dy  = 8 + Math.random() * 22; // drift downward as stag rises

        const el = document.createElement('span');
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = [
          'position:absolute',
          `left:${ox}px`,
          `top:${oy}px`,
          `width:${sz}px`,
          `height:${sz}px`,
          'border-radius:50%',
          `background:${col}`,
          `box-shadow:0 0 8px ${col},0 0 16px rgba(63,224,197,0.6)`,
          'pointer-events:none',
          `animation:particle-drift ${dur}ms ease-out forwards`,
          `--dx:${dx}px`,
          `--dy:${dy}px`,
        ].join(';');

        pc.appendChild(el);
        particlesRef.current.push(el);

        setTimeout(() => {
          el.remove();
          const i = particlesRef.current.indexOf(el);
          if (i !== -1) particlesRef.current.splice(i, 1);
        }, dur + 100);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    glide.finished.then(() => {
      cancelAnimationFrame(rafRef.current);
      bob.cancel();
      glow.cancel();
      particlesRef.current.forEach(p => p.remove());
      particlesRef.current = [];
      setPhase('fading');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === 'gliding') {
      const id = requestAnimationFrame(() => startGlide());
      return () => cancelAnimationFrame(id);
    }
  }, [phase, startGlide]);

  /* Phase 4: brief pause then reveal tiles */
  useEffect(() => {
    if (phase !== 'fading') return;
    const id = setTimeout(() => setPhase('revealed'), 1500);
    return () => clearTimeout(id);
  }, [phase]);

  /* Clear mask on reset */
  useEffect(() => {
    if (phase === 'gloom' && fogRef.current) {
      fogRef.current.style.maskImage = '';
      (fogRef.current.style as any).webkitMaskImage = '';
    }
  }, [phase]);

  const showFog    = phase !== 'revealed';
  const showButton = phase === 'gloom';
  const showStag   = phase === 'gliding' || phase === 'fading';
  const showTiles  = phase === 'revealed';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#050c12',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Skip link */}
      {phase !== 'revealed' && (
        <button
          onClick={skipToRevealed}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.5rem',
            zIndex: 50,
            background: 'transparent',
            border: '1px solid rgba(111,232,212,0.35)',
            borderRadius: '0.25rem',
            color: 'rgba(111,232,212,0.7)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            padding: '0.35rem 0.75rem',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'color 150ms, border-color 150ms',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#6FE8D4';
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#6FE8D4';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(111,232,212,0.7)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(111,232,212,0.35)';
          }}
        >
          Skip →
        </button>
      )}

      {/* Fog layer */}
      {showFog && (
        <div
          ref={fogRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: phase === 'fading' ? 0 : 1,
            transition: phase === 'fading' ? 'opacity 1.4s ease' : undefined,
          }}
        >
          {BLOBS.map((b, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: b.top,
                left: b.left,
                width: b.w,
                height: b.h,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 40% 40%,
                  rgba(15,35,50,${b.opacity}) 0%,
                  rgba(10,25,38,${b.opacity * 0.6}) 50%,
                  transparent 75%)`,
                filter: 'blur(32px)',
                animation: `fog-drift-${(i % 2) + 1} ${b.dur}s ease-in-out infinite ${b.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Particle container */}
      <div
        ref={particleContainerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      />

      {/* EXPECTO PATRONUM button */}
      {showButton && (
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <button
            onClick={() => setPhase('summoning')}
            className="patronum-btn"
            style={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 500,
              fontSize: 'clamp(1.1rem, 3vw, 1.75rem)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#E8F4F4',
              background: 'transparent',
              border: '2px solid rgba(63,224,197,0.5)',
              borderRadius: '0.25rem',
              padding: '1.1rem 2.5rem',
              cursor: 'pointer',
              textShadow: '0 0 20px rgba(63,224,197,0.6)',
              boxShadow: '0 0 30px rgba(63,224,197,0.15), inset 0 0 30px rgba(63,224,197,0.05)',
              transition: 'border-color 200ms, box-shadow 200ms',
              animation: 'btn-pulse 3s ease-in-out infinite',
            }}
          >
            Expecto Patronum
          </button>
          <p style={{
            marginTop: '1.25rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(155,179,184,0.5)',
            letterSpacing: '0.06em',
          }}>
            cast a spell to reveal my contact
          </p>
        </div>
      )}

      {/* Summoning flash */}
      {phase === 'summoning' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(63,224,197,0.3) 0%, transparent 65%)',
            animation: 'summon-flash 0.7s ease-out forwards',
            pointerEvents: 'none',
          }}
          onAnimationEnd={() => setPhase('gliding')}
        />
      )}

      {/* Stag */}
      {showStag && (
        <img
          ref={stagRef}
          src={patronusSrc}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${stagSize}px`,
            height: `${stagSize}px`,
            objectFit: 'contain',
            mixBlendMode: 'screen',
            zIndex: 5,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 32px rgba(63,224,197,0.9)) drop-shadow(0 0 64px rgba(63,224,197,0.5)) brightness(1.2)',
            animation: phase === 'fading'
              ? 'stag-fade-out 1s ease forwards'
              : 'stag-fade-in 0.5s ease forwards',
          }}
        />
      )}

      {/* Contact tiles */}
      {showTiles && (
        <ContactTiles
          github={github}
          linkedin={linkedin}
          email={email}
          name={name}
          location={location}
          letterSrc={letterSrc}
          onReset={reset}
        />
      )}

      <style>{`
        @keyframes fog-drift-1 {
          0%   { transform: translateX(0)     translateY(0)     scale(1);    }
          33%  { transform: translateX(40px)  translateY(-20px) scale(1.05); }
          66%  { transform: translateX(-25px) translateY(15px)  scale(0.97); }
          100% { transform: translateX(0)     translateY(0)     scale(1);    }
        }
        @keyframes fog-drift-2 {
          0%   { transform: translateX(0)     translateY(0)     scale(1);    }
          40%  { transform: translateX(-35px) translateY(25px)  scale(1.03); }
          75%  { transform: translateX(20px)  translateY(-18px) scale(0.98); }
          100% { transform: translateX(0)     translateY(0)     scale(1);    }
        }
        @keyframes btn-pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(63,224,197,0.15), inset 0 0 30px rgba(63,224,197,0.05);
            border-color: rgba(63,224,197,0.5);
          }
          50% {
            box-shadow: 0 0 55px rgba(63,224,197,0.35), inset 0 0 40px rgba(63,224,197,0.12);
            border-color: rgba(63,224,197,0.85);
          }
        }
        @keyframes summon-flash {
          0%   { opacity: 0; transform: scale(0.8); }
          30%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes stag-fade-in {
          from { opacity: 0; filter: drop-shadow(0 0 8px rgba(63,224,197,0.3)) brightness(0.8); }
          to   { opacity: 1; filter: drop-shadow(0 0 32px rgba(63,224,197,0.9)) drop-shadow(0 0 64px rgba(63,224,197,0.5)) brightness(1.2); }
        }
        @keyframes stag-fade-out {
          0%   { opacity: 1; filter: drop-shadow(0 0 32px rgba(63,224,197,0.9)) drop-shadow(0 0 64px rgba(63,224,197,0.5)) brightness(1.2); }
          55%  { opacity: 0.7; filter: drop-shadow(0 0 60px rgba(63,224,197,1)) drop-shadow(0 0 120px rgba(63,224,197,0.8)) brightness(2.2); }
          100% { opacity: 0; filter: drop-shadow(0 0 0px rgba(63,224,197,0)) brightness(1); }
        }
        @keyframes tile-in {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes particle-drift {
          from { opacity: 1;   transform: translate(0, 0) scale(1);                          }
          to   { opacity: 0;   transform: translate(var(--dx), var(--dy)) scale(0.4);        }
        }
        @media (prefers-reduced-motion: reduce) {
          .patronum-btn { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Floating magical letters ── */
const LETTER_DATA = [
  { top: '10%',  left: '5%',   right: 'auto', bottom: 'auto', size: 140, rot: '-8deg',  floatDur: '6.2s', floatDelay: '0s',    glowDur: '4.1s', glowDelay: '-1.3s', opacity: 0.75, revealDelay: '0.9s',  cls: 'rl-letter' },
  { top: '15%',  left: 'auto', right: '8%',   bottom: 'auto', size: 120, rot: '12deg',  floatDur: '7.5s', floatDelay: '-2.1s', glowDur: '5.3s', glowDelay: '-0.8s', opacity: 0.70, revealDelay: '1.1s',  cls: 'rl-letter' },
  { top: '50%',  left: '3%',   right: 'auto', bottom: 'auto', size: 100, rot: '-15deg', floatDur: '5.8s', floatDelay: '-1.4s', glowDur: '3.9s', glowDelay: '-2.2s', opacity: 0.58, revealDelay: '1.3s',  cls: 'rl-letter rl-letter--mid' },
  { top: 'auto', left: 'auto', right: '5%',   bottom: '20%',  size: 130, rot: '6deg',   floatDur: '6.9s', floatDelay: '-3.2s', glowDur: '4.7s', glowDelay: '-1.0s', opacity: 0.72, revealDelay: '1.5s',  cls: 'rl-letter' },
  { top: 'auto', left: '12%',  right: 'auto', bottom: '10%',  size: 110, rot: '-20deg', floatDur: '7.1s', floatDelay: '-0.7s', glowDur: '5.0s', glowDelay: '-3.5s', opacity: 0.62, revealDelay: '1.7s',  cls: 'rl-letter rl-letter--far' },
] as const;

function FloatingLetters({ src }: { src: string }) {
  return (
    <>
      {LETTER_DATA.map((l, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden="true"
          className={l.cls}
          style={{
            position: 'absolute',
            top:    l.top,
            left:   l.left,
            right:  l.right,
            bottom: l.bottom,
            width:  `${l.size}px`,
            height: `${l.size}px`,
            objectFit: 'contain',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 2,
            opacity: 0,
            ['--rot' as any]:          l.rot,
            ['--float-dur' as any]:    l.floatDur,
            ['--float-delay' as any]:  l.floatDelay,
            ['--glow-dur' as any]:     l.glowDur,
            ['--glow-delay' as any]:   l.glowDelay,
            ['--letter-opacity' as any]: l.opacity,
            ['--reveal-delay' as any]: l.revealDelay,
            animation: [
              `rl-float  var(--float-dur)  ease-in-out infinite var(--float-delay)`,
              `rl-glow   var(--glow-dur)   ease-in-out infinite var(--glow-delay)`,
              `rl-reveal 0.8s ease forwards var(--reveal-delay)`,
              `rl-wings  2s ease-in-out infinite`,
            ].join(', '),
          }}
        />
      ))}
    </>
  );
}

/* ── Drifting teal powder (50 deterministic particles) ── */
const POWDER = Array.from({ length: 50 }, (_, i) => ({
  left:  (i * 37 + 11) % 100,
  dur:   10 + (i * 7 % 9),          // 10–18s
  delay: -((i * 5 + 3) % 14),       // 0–14s stagger
  size:  (i % 3) + 1,               // 1–3px
  color: i % 5 === 0 ? '#B8F2E6' : i % 3 === 0 ? '#6FE8D4' : '#3FE0C5',
  sway:  ((i * 13 + 7) % 30) - 15,  // ±15px
}));

function ContactPowder() {
  return (
    <div
      aria-hidden="true"
      className="rl-powder"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      {POWDER.map((p, i) => (
        <span
          key={i}
          className="rl-particle"
          style={{
            position: 'absolute',
            top: '-5vh',
            left: `${p.left}%`,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 6px ${p.color}, 0 0 12px rgba(63,224,197,0.5)`,
            pointerEvents: 'none',
            ['--fall-dur' as any]:   `${p.dur}s`,
            ['--fall-delay' as any]: `${p.delay}s`,
            ['--sway' as any]:       `${p.sway}px`,
            animation: `rl-powder-fall var(--fall-dur) linear infinite var(--fall-delay)`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Contact tiles ── */
function ContactTiles({
  github, linkedin, email, name, location, letterSrc, onReset,
}: {
  github: string; linkedin: string; email: string;
  name: string; location?: string; letterSrc: string; onReset: () => void;
}) {
  const tiles = [
    {
      label: 'GitHub',
      value: github.replace('https://', ''),
      href:  github,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/matin-monshizadeh',
      href:  linkedin,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      label: 'Email',
      value: email,
      href:  `mailto:${email}`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
        </svg>
      ),
    },
    ...(location ? [{
      label: 'Location',
      value: location,
      href:  null as string | null,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    }] : []),
  ];

  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '100%',
      minHeight: '100vh',
      padding: '3rem 1.5rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Decorative layers — behind tile content */}
      <FloatingLetters src={letterSrc} />
      <ContactPowder />

      {/* Tile content wrapper — constrained width, sits above decorations */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '52rem' }}>
        <h1 style={{
          fontFamily: '"Cinzel", serif',
          fontWeight: 500,
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: '#E8F4F4',
          letterSpacing: '0.12em',
          textShadow: '0 0 28px rgba(63,224,197,0.4)',
          margin: '0 0 0.5rem',
          animation: 'tile-in 0.7s ease both',
        }}>
          {name}
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          color: '#9BB3B8',
          marginBottom: '3rem',
          animation: 'tile-in 0.7s ease 0.1s both',
        }}>
          Let's connect
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {tiles.map((t, i) => (
            <TileCard key={t.label} tile={t} delay={i * 0.12 + 0.2} />
          ))}
        </div>

        <button
          onClick={onReset}
          style={{
            fontFamily: '"Cinzel", serif',
            fontWeight: 500,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            color: 'rgba(111,232,212,0.6)',
            background: 'transparent',
            border: '1px solid rgba(111,232,212,0.25)',
            borderRadius: '0.25rem',
            padding: '0.6rem 1.4rem',
            cursor: 'pointer',
            transition: 'color 200ms, border-color 200ms',
            animation: 'tile-in 0.7s ease 0.7s both',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#6FE8D4';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(111,232,212,0.6)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(111,232,212,0.6)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(111,232,212,0.25)';
          }}
        >
          Mischief Managed ✨ Reset
        </button>
      </div>{/* end tile content wrapper */}

      <style>{`
        /* ── Letter animations ── */
        @keyframes rl-float {
          0%,100% { transform: rotate(var(--rot)) translateY(-8px) translateX(-3px); }
          25%      { transform: rotate(calc(var(--rot) + 2deg)) translateY(0px) translateX(4px); }
          50%      { transform: rotate(var(--rot)) translateY(8px) translateX(-2px); }
          75%      { transform: rotate(calc(var(--rot) - 2deg)) translateY(2px) translateX(3px); }
        }
        @keyframes rl-glow {
          0%,100% { filter: drop-shadow(0 0 20px rgba(63,224,197,0.3)) drop-shadow(0 0 40px rgba(63,224,197,0.15)); }
          50%      { filter: drop-shadow(0 0 28px rgba(63,224,197,0.55)) drop-shadow(0 0 55px rgba(63,224,197,0.3)); }
        }
        @keyframes rl-reveal {
          from { opacity: 0; }
          to   { opacity: var(--letter-opacity, 0.75); }
        }
        @keyframes rl-wings {
          0%,100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.02); }
        }
        /* ── Powder animations ── */
        @keyframes rl-powder-fall {
          0%   { transform: translateY(-5vh)   translateX(0);                         opacity: 0; }
          8%   { opacity: 1; }
          30%  { transform: translateY(30vh)   translateX(var(--sway)); }
          70%  { transform: translateY(70vh)   translateX(calc(var(--sway) * -0.4)); }
          88%  { opacity: 0.8; }
          100% { transform: translateY(105vh)  translateX(0);                        opacity: 0; }
        }
        /* ── Responsive: hide letters ── */
        @media (max-width: 1023px) { .rl-letter--mid { display: none; } }
        @media (max-width: 767px)  {
          .rl-letter--far { display: none; }
          .rl-letter { width: 80px !important; height: 80px !important; }
        }
        /* ── Responsive: reduce powder ── */
        @media (min-width: 768px) and (max-width: 1023px) { .rl-particle:nth-child(n+31) { display: none; } }
        @media (max-width: 767px)                          { .rl-particle:nth-child(n+16) { display: none; } }
        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .rl-letter  { animation: none !important; opacity: var(--letter-opacity, 0.75) !important; }
          .rl-powder  { display: none; }
        }
      `}</style>
    </div>
  );
}

function TileCard({
  tile,
  delay,
}: {
  tile: { label: string; value: string; href: string | null; icon: React.ReactNode };
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <div
      style={{
        background: hovered ? 'rgba(63,224,197,0.08)' : 'rgba(15,26,34,0.7)',
        border: `1px solid ${hovered ? 'rgba(63,224,197,0.5)' : 'rgba(63,224,197,0.15)'}`,
        borderRadius: '0.5rem',
        padding: '1.75rem 1.25rem',
        textAlign: 'center',
        transition: 'background 200ms, border-color 200ms, box-shadow 200ms',
        boxShadow: hovered ? '0 0 28px rgba(63,224,197,0.18)' : 'none',
        animation: `tile-in 0.6s ease ${delay}s both`,
        cursor: tile.href ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        color: hovered ? '#3FE0C5' : '#5A6F75',
        marginBottom: '0.75rem',
        transition: 'color 200ms',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {tile.icon}
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#5A6F75',
        marginBottom: '0.4rem',
      }}>
        {tile.label}
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.875rem',
        color: hovered ? '#E8F4F4' : '#9BB3B8',
        transition: 'color 200ms',
        wordBreak: 'break-all',
      }}>
        {tile.value}
      </div>
    </div>
  );

  if (!tile.href) return inner;

  return (
    <a
      href={tile.href}
      target={tile.href.startsWith('mailto') ? undefined : '_blank'}
      rel={tile.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {inner}
    </a>
  );
}
