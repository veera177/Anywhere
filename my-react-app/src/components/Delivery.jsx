import { useEffect, useRef, useState } from 'react';

function Delivery() {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            });
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const revealStyle = {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    return (
        <div 
            ref={ref} 
            className="delivery-card" 
            id="delivery" 
            style={revealStyle}
        >
            <img 
                src="https://cdn-icons-png.flaticon.com/512/2933/2933405.png" 
                alt="Delivery charges" 
                style={{ width: '60px', height: '60px' }} 
            />
            <h2>Transparent & Fair Delivery Rates</h2>
            <div className="delivery-content">
                <p><strong>We believe in complete honesty when it comes to pricing. No hidden costs, no markups.</strong></p>
                <p>Our promise is simple: We charge exactly what the store charges. We strictly avoid adding any hidden markups to the items you order.</p>
                <ul className="delivery-list">
                    <li>
                        <strong>Store Price Match Guarantee:</strong> You pay the exact amount printed on the store's bill.
                    </li>
                    <li>
                        <strong>Reasonable Delivery Fee:</strong> We only charge a small, transparent fee for our delivery service.
                    </li>
                </ul>
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                    Rest assured, we will calculate and display the exact delivery fee upfront before you confirm your order, so you know exactly what you are paying for.
                </p>
            </div>
        </div>
    );
}

export default Delivery;