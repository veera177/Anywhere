import { useEffect, useState } from 'react';
import './SplashScreen.css';

function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'idle' | 'exit'

    useEffect(() => {
        // enter → idle after logo slides in (~800ms)
        const t1 = setTimeout(() => setPhase('idle'), 800);
        // idle → exit at 4200ms (leaves 800ms for exit anim → total ≈5s)
        const t2 = setTimeout(() => setPhase('exit'), 4200);
        // call onDone after exit anim completes
        const t3 = setTimeout(() => onDone?.(), 5000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    return (
        <div className={`splash-root splash-${phase}`} aria-label="Loading Anywhere" role="status">

            {/* Full-screen yellow wash that slides up on exit */}
            <span className="splash-bg-fill" aria-hidden="true" />

            {/* Particle dots */}
            {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="splash-particle" style={{ '--pi': i }} aria-hidden="true" />
            ))}

            {/* Centre stage */}
            <div className="splash-stage">

                {/* Outer orbit ring */}
                <span className="splash-orbit splash-orbit-1" aria-hidden="true" />
                <span className="splash-orbit splash-orbit-2" aria-hidden="true" />

                {/* Pulsing halo */}
                <span className="splash-halo" aria-hidden="true" />

                {/* Logo disc */}
                <div className="splash-disc">
                    <span className="splash-disc-ring splash-disc-ring-1" aria-hidden="true" />
                    <span className="splash-disc-ring splash-disc-ring-2" aria-hidden="true" />
                    <span className="splash-logo-letter" aria-hidden="true">A</span>
                </div>

                {/* Wordmark slides up after disc */}
                <div className="splash-wordmark">
                    <span className="splash-word-anywhere">Anywhere</span>
                    <span className="splash-word-tag">Deliver · Discover · Depend</span>
                </div>

                {/* Progress bar */}
                <div className="splash-progress-track" aria-hidden="true">
                    <span className="splash-progress-bar" />
                </div>

            </div>
        </div>
    );
}

export default SplashScreen;
