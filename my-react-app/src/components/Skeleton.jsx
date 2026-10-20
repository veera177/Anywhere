/**
 * Skeleton — shimmer placeholder shown while data is loading.
 *
 * Replaces the plain "Loading..." text that service pages used to render, so
 * the layout doesn't jump when real content arrives. Styling lives in
 * index.css under the "Skeleton loaders" section (.aw-skeleton*).
 */

/** A single shimmering bar. Use `width` for inline text placeholders. */
export function SkeletonLine({ width, className = '' }) {
    const size = width === 'short' || width === 'medium' ? width : '';
    return (
        <div
            className={`aw-skeleton aw-skeleton-line ${size} ${className}`.trim()}
            aria-hidden="true"
        />
    );
}

/** A shimmering media block, sized to match product/restaurant card images. */
export function SkeletonBlock({ height, className = '' }) {
    return (
        <div
            className={`aw-skeleton aw-skeleton-block ${className}`.trim()}
            style={height ? { height } : undefined}
            aria-hidden="true"
        />
    );
}

/** Full card placeholder for restaurant / store / pharmacy grids. */
export function SkeletonCard({ lines = 2, className = '' }) {
    return (
        <div className={`aw-skeleton-card ${className}`.trim()} aria-hidden="true">
            <SkeletonBlock />
            <SkeletonLine width="medium" />
            <SkeletonLine width="short" />
            {Array.from({ length: Math.max(0, lines - 2) }, (_, i) => (
                <SkeletonLine key={i} width="medium" />
            ))}
        </div>
    );
}

/** Responsive grid of skeleton cards. */
export function SkeletonGrid({ count = 6, lines = 2, className = '' }) {
    return (
        <div className={`aw-skeleton-grid ${className}`.trim()} aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
                <SkeletonCard key={i} lines={lines} />
            ))}
        </div>
    );
}

/** Inline "working on it" status with a spinning dot. */
export function SkeletonStatus({ children = 'Loading…' }) {
    return (
        <span className="aw-skeleton-status" role="status">
            <span className="aw-skeleton-dot" aria-hidden="true" />
            {children}
        </span>
    );
}

export default SkeletonStatus;