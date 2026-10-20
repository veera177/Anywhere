import { useEffect, useState } from 'react';

function AISplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'idle' | 'exit'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('idle'), 800);
        const t2 = setTimeout(() => setPhase('exit'), 4200);
        const t3 = setTimeout(() => onDone?.(), 5000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    return (
        <div className={`ai-splash ai-splash-${phase}`} aria-label="Anywhere AI Loading" role="status">
            {/* Yellow background fill that appears on exit */}
            <div className="ai-splash-bg-fill" aria-hidden="true" />

            {/* Animated particles */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ai-splash-particle" style={{ '--pi': i }} aria-hidden="true" />
            ))}

            {/* Centre stage */}
            <div className="ai-splash-stage">
                {/* Orbiting rings */}
                <div className="ai-splash-orbit ai-splash-orbit-1" aria-hidden="true" />
                <div className="ai-splash-orbit ai-splash-orbit-2" aria-hidden="true" />

                {/* Pulsing halo */}
                <div className="ai-splash-halo" aria-hidden="true" />

                {/* Logo disc */}
                <div className="ai-splash-disc">
                    <div className="ai-splash-disc-ring ai-splash-disc-ring-1" aria-hidden="true" />
                    <div className="ai-splash-disc-ring ai-splash-disc-ring-2" aria-hidden="true" />
                    <div className="ai-splash-logo-letter" aria-hidden="true">A</div>
                </div>

                {/* Wordmark */}
                <div className="ai-splash-wordmark">
                    <div className="ai-splash-word-anywhere">Anywhere</div>
                    <div className="ai-splash-word-tag">All Services, One Tap</div>
                </div>

                {/* Progress bar */}
                <div className="ai-splash-progress-track" aria-hidden="true">
                    <div className="ai-splash-progress-bar" />
                </div>
            </div>

            <style>{`
                /* ── Keyframes ── */
                @keyframes aiSplashRootEnter {
                    from { transform: translateY(-100%); }
                    to   { transform: translateY(0); }
                }
                @keyframes aiSplashRootExit {
                    from { transform: translateY(0); }
                    to   { transform: translateY(105%); }
                }
                @keyframes aiSplashBgExit {
                    0%   { transform: scaleY(0); transform-origin: bottom; }
                    40%  { transform: scaleY(1); transform-origin: bottom; }
                    100% { transform: scaleY(1); transform-origin: bottom; }
                }
                @keyframes aiSplashDiscIn {
                    0%   { opacity: 0; transform: scale(0.3) rotate(-30deg); }
                    60%  { transform: scale(1.12) rotate(6deg); }
                    80%  { transform: scale(0.95) rotate(-3deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes aiSplashDiscOut {
                    from { transform: scale(1);   opacity: 1; }
                    to   { transform: scale(1.6); opacity: 0; }
                }
                @keyframes aiSplashWordUp {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes aiSplashWordOut {
                    from { opacity: 1; transform: translateY(0); }
                    to   { opacity: 0; transform: translateY(-18px); }
                }
                @keyframes aiSplashTagIn {
                    from { opacity: 0; letter-spacing: 6px; }
                    to   { opacity: 0.8; letter-spacing: 2px; }
                }
                @keyframes aiSplashHalo {
                    0%   { transform: scale(1);   opacity: 0.55; }
                    100% { transform: scale(2.8); opacity: 0; }
                }
                @keyframes aiSplashOrbitSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes aiSplashProgress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
                @keyframes aiSplashParticle {
                    0%, 100% { transform: translate(0, 0)    scale(1);   opacity: 0.7; }
                    50%      { transform: translate(var(--px, 20px), var(--py, -40px)) scale(1.4); opacity: 0.3; }
                }
                @keyframes aiSplashRingSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                /* ── Root container ── */
                .ai-splash {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background: linear-gradient(135deg, #FFD700 0%, #FFED4E 100%);
                    display: grid;
                    place-items: center;
                    overflow: hidden;
                    font-family: 'Poppins', sans-serif;
                }
                .ai-splash-enter {
                    animation: aiSplashRootEnter 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .ai-splash-exit {
                    animation: aiSplashRootExit 0.8s cubic-bezier(0.55, 0, 1, 0.45) both;
                }

                /* ── Yellow bg fill on exit ── */
                .ai-splash-bg-fill {
                    position: absolute;
                    inset: 0;
                    background: #FFD700;
                    transform: scaleY(0);
                    transform-origin: bottom;
                    pointer-events: none;
                    z-index: 0;
                }
                .ai-splash-exit .ai-splash-bg-fill {
                    animation: aiSplashBgExit 0.8s ease both;
                }

                /* ── Particles ── */
                .ai-splash-particle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(17,24,39,0.4);
                    opacity: 0.6;
                    top: calc(50% + 140px * sin(calc(var(--pi) * 30deg)));
                    left: calc(50% + 140px * cos(calc(var(--pi) * 30deg)));
                    --px: calc((var(--pi) - 4) * 15px);
                    --py: calc((var(--pi) - 4) * -18px);
                    animation: aiSplashParticle calc(2.8s + var(--pi) * 0.2s) ease-in-out calc(var(--pi) * 0.15s) infinite;
                }
                @supports not (top: calc(50% + 140px * sin(30deg))) {
                    .ai-splash-particle:nth-child(1)  { top: 15%; left: 50%; }
                    .ai-splash-particle:nth-child(2)  { top: 22%; left: 72%; }
                    .ai-splash-particle:nth-child(3)  { top: 38%; left: 84%; }
                    .ai-splash-particle:nth-child(4)  { top: 60%; left: 80%; }
                    .ai-splash-particle:nth-child(5)  { top: 76%; left: 62%; }
                    .ai-splash-particle:nth-child(6)  { top: 82%; left: 46%; }
                    .ai-splash-particle:nth-child(7)  { top: 72%; left: 28%; }
                    .ai-splash-particle:nth-child(8)  { top: 56%; left: 12%; }
                }

                /* ── Stage ── */
                .ai-splash-stage {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0;
                    z-index: 1;
                }

                /* ── Halo pulse rings ── */
                .ai-splash-halo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 110px;
                    height: 110px;
                    margin-top: -55px;
                    margin-left: -55px;
                    border-radius: 50%;
                    border: 2.5px solid rgba(17,24,39,0.5);
                    pointer-events: none;
                    animation: aiSplashHalo 2s ease-out 0.6s infinite;
                }

                /* ── Orbit rings ── */
                .ai-splash-orbit {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    border-radius: 50%;
                    border-style: dashed;
                    border-color: rgba(17,24,39,0.2);
                    pointer-events: none;
                    transform-origin: center;
                }
                .ai-splash-orbit-1 {
                    width: 180px;
                    height: 180px;
                    margin-top: -90px;
                    margin-left: -90px;
                    border-width: 1.5px;
                    animation: aiSplashOrbitSpin 8s linear infinite;
                }
                .ai-splash-orbit-2 {
                    width: 240px;
                    height: 240px;
                    margin-top: -120px;
                    margin-left: -120px;
                    border-width: 1px;
                    border-color: rgba(17,24,39,0.1);
                    animation: aiSplashOrbitSpin 14s linear infinite reverse;
                }

                /* ── Logo disc ── */
                .ai-splash-disc {
                    position: relative;
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    background: #111827;
                    display: grid;
                    place-items: center;
                    box-shadow:
                        0 0 0 10px rgba(17,24,39,0.15),
                        0 24px 64px rgba(0,0,0,0.3),
                        0 4px 20px rgba(0,0,0,0.25);
                    animation: aiSplashDiscIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
                }
                .ai-splash-exit .ai-splash-disc {
                    animation: aiSplashDiscOut 0.4s ease both;
                }

                /* Disc rings */
                .ai-splash-disc-ring {
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    pointer-events: none;
                }
                .ai-splash-disc-ring-1 {
                    border-top-color: rgba(255,215,0,0.5);
                    border-right-color: rgba(255,215,0,0.5);
                    animation: aiSplashRingSpin 1.8s linear infinite;
                }
                .ai-splash-disc-ring-2 {
                    inset: -12px;
                    border-bottom-color: rgba(255,215,0,0.25);
                    animation: aiSplashRingSpin 3s linear infinite reverse;
                }

                /* Large letter ── */
                .ai-splash-logo-letter {
                    font-family: 'Poppins', sans-serif;
                    font-size: 3.2rem;
                    font-weight: 900;
                    color: #FFD700;
                    line-height: 1;
                    user-select: none;
                    letter-spacing: -2px;
                }

                /* ── Wordmark ── */
                .ai-splash-wordmark {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    margin-top: 28px;
                    overflow: hidden;
                }

                .ai-splash-word-anywhere {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(2rem, 8vw, 3.4rem);
                    font-weight: 900;
                    color: #111827;
                    letter-spacing: 1px;
                    line-height: 1;
                    opacity: 0;
                    animation: aiSplashWordUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards;
                    text-shadow: 0 2px 16px rgba(0,0,0,0.08);
                }
                .ai-splash-exit .ai-splash-word-anywhere {
                    animation: aiSplashWordOut 0.3s ease both;
                }

                .ai-splash-word-tag {
                    font-family: 'Sora', sans-serif;
                    font-size: clamp(0.7rem, 2vw, 0.85rem);
                    font-weight: 600;
                    color: rgba(17,24,39,0.65);
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    opacity: 0;
                    animation: aiSplashTagIn 0.7s ease 1.15s forwards;
                }

                /* ── Progress bar ── */
                .ai-splash-progress-track {
                    width: 160px;
                    height: 3px;
                    background: rgba(17,24,39,0.15);
                    border-radius: 99px;
                    margin-top: 32px;
                    overflow: hidden;
                }
                .ai-splash-progress-bar {
                    display: block;
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #111827, #FFD700);
                    border-radius: 99px;
                    animation: aiSplashProgress 4.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
                    box-shadow: 0 0 8px rgba(17,24,39,0.3);
                }

                /* ── Reduced motion ── */
                @media (prefers-reduced-motion: reduce) {
                    .ai-splash, .ai-splash-disc, .ai-splash-word-anywhere, .ai-splash-word-tag,
                    .ai-splash-progress-bar, .ai-splash-halo, .ai-splash-orbit, .ai-splash-particle,
                    .ai-splash-disc-ring, .ai-splash-logo-letter {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default AISplashScreen;
