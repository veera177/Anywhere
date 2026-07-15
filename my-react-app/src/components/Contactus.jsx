function Contactus() {
    return (
        <footer className="contactus" id="contact-us">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>📍 123, Anna Salai, Chennai, Tamil Nadu 600002</p>
                    <p>📞 98765 43210</p>
                    <p>✉️ support@anywhere.com</p>
                    <p>🌐 www.anywhere.com</p>
                </div>
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul className="footer-quick-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#partner">Partner With Us</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook">📘 Facebook</a>
                        <a href="#" className="social-link" aria-label="Instagram">📸 Instagram</a>
                        <a href="#" className="social-link" aria-label="Twitter">🐦 Twitter</a>
                    </div>
                </div>
                <div className="footer-section">
                    <h3>About Anywhere</h3>
                    <p>Your trusted local delivery partner. From food and groceries to medicines and couriers — we deliver everything right to your doorstep.</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 Anywhere. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Contactus;
