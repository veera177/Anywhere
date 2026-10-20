import { useReveal, revealClass } from '../hooks/useReveal.js';

function Delivery() {
    const [ref, isVisible] = useReveal();

    return (
        <div
            ref={ref}
            className={revealClass(isVisible, 'delivery-card')}
            id="delivery"
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