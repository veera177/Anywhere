import React, { useState } from 'react';

function Register({ onBack, onSignInClick }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const response = await fetch(
            "http://localhost:8080/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    fullName: formData.fullName,

                    email: formData.email,

                    phone: formData.phone,

                    password: formData.password

                })
            }
        );

        const message = await response.text();

        if (response.ok) {

    alert(message);

    setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });

    onSignInClick();

} else {

    alert(message);
}

   } catch (error) {

        console.log(error);

        alert("Server Error");

    }

};

    return (
        <div className="sign-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                .sign-container {
                    font-family: 'Poppins', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: var(--bg-0);
                    color: var(--text);
                    position: relative;
                    overflow: hidden;
                    transition: background-color 0.4s ease, color 0.4s ease;
                }

                /* Background Pattern */
                .sign-container::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: radial-gradient(var(--border) 1px, transparent 1px);
                    background-size: 20px 20px;
                    opacity: 0.6;
                    z-index: 0;
                }

                .sign-card {
                    background: var(--card);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: var(--shadow-lg);
                    width: 100%;
                    max-width: 420px;
                    z-index: 1;
                    border: 1px solid var(--border);
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUpFade {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .sign-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .sign-header h1 {
                    margin: 0;
                    color: var(--text);
                    font-weight: 700;
                    font-size: 1.8rem;
                    letter-spacing: -0.5px;
                }

                .sign-header p {
                    margin-top: 8px;
                    color: var(--muted);
                    font-size: 0.95rem;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text);
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .form-input {
                    width: 100%;
                    padding: 14px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    font-family: inherit;
                    background-color: var(--bg-1);
                    color: var(--text);
                }

                .form-input:focus {
                    border-color: var(--accent-1);
                    background-color: var(--card-strong);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
                    outline: none;
                }

                .sign-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: var(--accent-1);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-family: inherit;
                    margin-top: 10px;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }

                .sign-btn:hover {
                    background-color: var(--accent-2);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.35);
                }

                .sign-btn:active {
                    transform: translateY(0);
                }

                .sign-footer {
                    margin-top: 24px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--muted);
                }

                .sign-link {
                    color: var(--accent-1);
                    font-weight: 600;
                    text-decoration: none;
                    margin-left: 5px;
                    cursor: pointer;
                }

                .sign-link:hover {
                    text-decoration: underline;
                    color: var(--accent-2);
                }

                .back-btn {
                    position: absolute;
                    top: 30px;
                    left: 30px;
                    background: var(--card-strong);
                    border: 1px solid var(--border);
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: inherit;
                    color: var(--text);
                    font-weight: 500;
                    transition: all 0.2s;
                    z-index: 10;
                    box-shadow: var(--shadow);
                }
                .back-btn:hover {
                    transform: translateX(-3px);
                    border-color: var(--border-hover);
                    box-shadow: var(--shadow-lg);
                }
            `}</style>
            
            <button className="back-btn" onClick={onBack}>
                <span>←</span> Back
            </button>

            <div className="sign-card">
                <div className="sign-header">
                    <h1>Create Account</h1>
                    <p>Join Anywhere for seamless deliveries</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input 
                            type="text" 
                            id="fullName" 
                            name="fullName"
                            className="form-input" 
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email"
                            className="form-input" 
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone"
                            className="form-input" 
                            placeholder="98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            className="form-input" 
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required 
                        />
                    </div>

                    <button type="submit" className="sign-btn">Register</button>
                </form>

                <div className="sign-footer">
                    Already have an account? 
                    <span className="sign-link" onClick={onSignInClick}>Sign In</span>
                </div>
            </div>
        </div>
    )
}

export default Register;
