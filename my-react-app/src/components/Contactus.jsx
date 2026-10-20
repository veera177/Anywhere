/**
 * Anywhere footer.
 *
 * The markup here deliberately uses the `.ft-*` class contract that already
 * exists in Contactus.css (brand column, service links, contact list, bottom
 * bar) instead of introducing a second footer stylesheet.
 */
import "./Contactus.css";
const serviceLinks = [
    { label: 'Food Delivery', icon: '🍽️', href: '#services' },
    { label: 'Grocery Delivery', icon: '🛒', href: '#services' },
    { label: 'Medicine Delivery', icon: '💊', href: '#services' },
    { label: 'Local Courier', icon: '🚚', href: '#services' },
];

const quickLinks = [
    { label: 'Home', icon: '🏠', href: '#home' },
    { label: 'All Services', icon: '🧭', href: '#services' },
    { label: 'Partner With Us', icon: '🤝', href: '#partner' },
    { label: 'Contact', icon: '✉️', href: '#contact-us' },
];

const socials = [
    { label: 'Facebook', icon: '📘', color: '#1877f2' },
    { label: 'Instagram', icon: '📸', color: '#e1306c' },
    { label: 'X', icon: '🐦', color: '#111827' },
];

function Contactus() {
    const handleNav = (event, href) => {
        event.preventDefault();
        document
            .getElementById(href.replace('#', ''))
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <footer className="ft-root" id="contact-us">
            <div className="ft-wave" aria-hidden="true">
                <svg viewBox="0 0 1440 80" preserveAspectRatio="none" focusable="false">
                    <path
                        d="M0,40 C240,80 480,0 720,32 C960,64 1200,8 1440,40 L1440,80 L0,80 Z"
                        fill="rgba(0,0,0,0.06)"
                    />
                </svg>
            </div>

            <div className="ft-inner">
                <div className="ft-col ft-col--brand ft-anim" style={{ '--ft-d': '0ms' }}>
                    <div className="ft-logo">
                        <span className="ft-logo-disc" aria-hidden="true">A</span>
                        <span className="ft-logo-name">Anywhere</span>
                    </div>
                    <p className="ft-tagline">
                        Food, grocery, medicine and courier delivered by verified local
                        partners across Tamil Nadu.
                    </p>
                    <div className="ft-socials">
                        {socials.map((social) => (
                            <a
                                key={social.label}
                                className="ft-social-btn"
                                href="#contact-us"
                                aria-label={social.label}
                                style={{ '--s-color': social.color }}
                                onClick={(event) => handleNav(event, '#contact-us')}
                            >
                                <span aria-hidden="true">{social.icon}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="ft-col ft-anim" style={{ '--ft-d': '80ms' }}>
                    <h3 className="ft-heading">
                        <span className="ft-heading-icon" aria-hidden="true">🧭</span>
                        Services
                    </h3>
                    <ul className="ft-list">
                        {serviceLinks.map((link, index) => (
                            <li
                                className="ft-list-item"
                                key={link.label}
                                style={{ '--item-d': `${index * 60}ms` }}
                            >
                                <a className="ft-link" href={link.href} onClick={(event) => handleNav(event, link.href)}>
                                    <span className="ft-link-icon" aria-hidden="true">{link.icon}</span>
                                    <span className="ft-link-text">{link.label}</span>
                                    <span className="ft-link-arrow" aria-hidden="true">→</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="ft-col ft-anim" style={{ '--ft-d': '160ms' }}>
                    <h3 className="ft-heading">
                        <span className="ft-heading-icon" aria-hidden="true">🔗</span>
                        Quick Links
                    </h3>
                    <ul className="ft-list">
                        {quickLinks.map((link, index) => (
                            <li
                                className="ft-list-item"
                                key={link.label}
                                style={{ '--item-d': `${index * 60}ms` }}
                            >
                                <a className="ft-link" href={link.href} onClick={(event) => handleNav(event, link.href)}>
                                    <span className="ft-link-icon" aria-hidden="true">{link.icon}</span>
                                    <span className="ft-link-text">{link.label}</span>
                                    <span className="ft-link-arrow" aria-hidden="true">→</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="ft-col ft-anim" style={{ '--ft-d': '240ms' }}>
                    <h3 className="ft-heading">
                        <span className="ft-heading-icon" aria-hidden="true">📞</span>
                        Contact
                    </h3>
                    <div className="ft-contact-list">
                        <div className="ft-contact-item">
                            <span className="ft-contact-icon" aria-hidden="true">📍</span>
                            <div>
                                <p className="ft-contact-label">Address</p>
                                <span>123, Anna Salai, Chennai, Tamil Nadu 600002</span>
                            </div>
                        </div>
                        <div className="ft-contact-item">
                            <span className="ft-contact-icon" aria-hidden="true">📞</span>
                            <div>
                                <p className="ft-contact-label">Phone</p>
                                <a className="ft-link" href="tel:9876543210">98765 43210</a>
                            </div>
                        </div>
                        <div className="ft-contact-item">
                            <span className="ft-contact-icon" aria-hidden="true">✉️</span>
                            <div>
                                <p className="ft-contact-label">Email</p>
                                <a className="ft-link" href="mailto:support@anywhere.com">support@anywhere.com</a>
                            </div>
                        </div>
                        <div className="ft-contact-item">
                            <span className="ft-contact-icon" aria-hidden="true">🌐</span>
                            <div>
                                <p className="ft-contact-label">Website</p>
                                <span>www.anywhere.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ft-bottom">
                <p className="ft-copyright">© {new Date().getFullYear()} Anywhere. All rights reserved.</p>
                <p className="ft-made">Made for every district in Tamil Nadu</p>
            </div>
        </footer>
    );
}

export default Contactus;
