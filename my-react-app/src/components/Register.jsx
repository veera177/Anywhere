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
            const response = await fetch('http://localhost:8080/Anywhere/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                alert("Registration Successful! Please Sign In.");
                onSignInClick();
            } else {
                alert("Registration Failed. Email might already exist.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Server error. Please try again later.");
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
                    background-color: #ffffff;
                    position: relative;
                    overflow: hidden;
                }

                /* Background Pattern */
                .sign-container::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
                    background-size: 20px 20px;
                    opacity: 0.5;
                    z-index: 0;
                }

                .sign-card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    width: 100%;
                    max-width: 420px;
                    z-index: 1;
                    border: 1px solid #eee;
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUpFade {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .sign-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .sign-header h1 {
                    margin: 0;
                    color: #111;
                    font-weight: 700;
                    font-size: 1.8rem;
                    letter-spacing: -0.5px;
                }

                .sign-header p {
                    margin-top: 8px;
                    color: #666;
                    font-size: 0.95rem;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #333;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .form-input {
                    width: 100%;
                    padding: 14px;
                    border: 1px solid #e1e1e1;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    font-family: inherit;
                    background-color: #f9f9f9;
                }

                .form-input:focus {
                    border-color: black;
                    background-color: white;
                    box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
                    outline: none;
                }

                .sign-btn {
                    width: 100%;
                    padding: 16px;
                    background-color: black;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                    margin-top: 10px;
                }

                .sign-btn:hover {
                    background-color: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .sign-btn:active {
                    transform: translateY(0);
                }

                .sign-footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #666;
                }

                .sign-link {
                    color: black;
                    font-weight: 600;
                    text-decoration: none;
                    margin-left: 5px;
                    cursor: pointer;
                }

                .sign-link:hover {
                    text-decoration: underline;
                }

                .back-btn {
                    position: absolute;
                    top: 30px;
                    left: 30px;
                    background: white;
                    border: 1px solid #eee;
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-family: inherit;
                    color: #333;
                    font-weight: 500;
                    transition: all 0.2s;
                    z-index: 10;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .back-btn:hover {
                    transform: translateX(-3px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
