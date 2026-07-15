import { useState } from "react";
import "./NavbarRepair.css";
import "./NavbarPolish.css";

function Navbar({ onSignInClick, onProfileClick, onCartClick, onOrdersClick }) {
    const [menuOpen, setMenuOpen] = useState(false);

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch {
        user = null;
    }

    const displayName = user?.fullName || user?.name || "Customer";
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2)
        .map((part) => part[0]).join("").toUpperCase();

    const handleScroll = (event, id) => {
        event.preventDefault();
        setMenuOpen(false);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <button className="nav-logo" onClick={(event) => handleScroll(event, "home")} aria-label="Anywhere home">
                <span id="title">Anywhere</span>
            </button>

            <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
                <span></span><span></span><span></span>
            </button>

            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
                <li><a href="#home" onClick={(event) => handleScroll(event, "home")}>Home</a></li>
                <li><a href="#services" onClick={(event) => handleScroll(event, "services")}>Services</a></li>
                <li><a href="#partner" onClick={(event) => handleScroll(event, "partner")}>Partner</a></li>
                <li><a href="#contact-us" onClick={(event) => handleScroll(event, "contact-us")}>Contact</a></li>
            </ul>

            <div className="nav-controls">
                <button className="nav-icon-action nav-cart-action" onClick={onCartClick}>
                    Cart
                </button>
                <button className="nav-icon-action nav-orders-action" onClick={onOrdersClick}>
                    Orders<span className="nav-notification-dot" aria-hidden="true"></span>
                </button>
                {user ? (
                    <>
                        <div className="nav-user" title={`Signed in as ${displayName}`}>
                            <span className="nav-avatar">{initials}</span>
                            <strong>{displayName}</strong>
                        </div>
                        <button className="nav-icon-action nav-profile-action" onClick={onProfileClick}>
                            Profile
                        </button>
                        <button className="nav-logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button className="button1 nav-signin" onClick={onSignInClick}>Sign In</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
