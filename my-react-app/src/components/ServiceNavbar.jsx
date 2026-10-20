import './ServiceNavbar.css';

/**
 * ServiceNavbar - Minimal, compact navbar for service pages
 * Matches home page navbar size and yellow theme
 * 
 * Props:
 * - onBack: callback when back button clicked
 * - rightContent: JSX for right side (e.g., cart count)
 */
export default function ServiceNavbar({ onBack, rightContent = null }) {
  return (
    <nav className="service-navbar">
      <div className="service-navbar-left">
        {onBack && (
          <button className="service-back-btn" onClick={onBack} aria-label="Go back">
            ← Back
          </button>
        )}
      </div>

      <div className="service-navbar-right">
        {rightContent}
      </div>
    </nav>
  );
}
