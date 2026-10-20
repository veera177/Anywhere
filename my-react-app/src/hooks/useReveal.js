import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — scroll-triggered fade + slide-up reveal.
 *
 * Replaces the inline IntersectionObserver logic that was duplicated in
 * Delivery.jsx / Partner.jsx / WhyChooseUs.jsx with a single shared hook.
 *
 * Returns [ref, isVisible]. Attach `ref` to the element to reveal and read
 * `isVisible` for a className or inline style. The observer disconnects after
 * the first intersection so scrolling back up never re-hides content.
 *
 * @param {number} threshold fraction of the element that must be visible
 * @param {string}  rootMargin IntersectionObserver root margin
 */
export function useReveal(threshold = 0.15, rootMargin = '0px 0px -60px 0px') {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        // Respect prefers-reduced-motion: show content immediately, no animation.
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setIsVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return [ref, isVisible];
}

/** Class helper so components stay declarative instead of inline-styled. */
export function revealClass(isVisible, base = '') {
    return [base, 'aw-reveal', isVisible ? 'aw-reveal-in' : ''].filter(Boolean).join(' ');
}

export default useReveal;
