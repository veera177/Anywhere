import React, { useState } from 'react';

function Sign({ onBack, onRegisterClick }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

   const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const response = await fetch(
            "http://localhost:8080/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email,

                    password

                })
            }
        );

        const user = await response.json();

       if (response.ok && user != null) {

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    alert("Login Successful!");
    window.location.reload();

    window.location.href = "/";

} else {

    alert("Invalid Email or Password");

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

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    font-size: 0.85rem;
                }

                .forgot-password {
                    color: #666;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .forgot-password:hover {
                    color: black;
                    text-decoration: underline;
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
                }

                .sign-btn:hover {
                    background-color: #333;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .sign-btn:active {
                    transform: translateY(0);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 25px 0;
                    color: #999;
                    font-size: 0.85rem;
                }

                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #eee;
                }

                .divider span {
                    padding: 0 10px;
                }

                .social-login {
                    display: flex;
                    gap: 10px;
                }

                .social-btn {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 12px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    transition: background-color 0.2s, border-color 0.2s;
                }

                .social-btn:hover {
                    background-color: #f9f9f9;
                    border-color: #ddd;
                }

                .social-btn img {
                    width: 20px;
                    height: 20px;
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
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            className="form-input" 
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            className="form-input" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="form-actions">
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#555'}}>
                            <input type="checkbox" style={{accentColor: 'black'}} /> Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className="sign-btn">Sign In</button>
                </form>

                <div className="divider">
                    <span>Or continue with</span>
                </div>

                <div className="social-login">
                    <button className="social-btn" title="Sign in with Google">
                        <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" />
                    </button>
                    <button className="social-btn" title="Sign in with Apple">
                        <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple" />
                    </button>
                    <button className="social-btn" title="Sign in with Facebook">
                        <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" alt="Facebook" />
                    </button>
                </div>

                <div className="sign-footer">
                    Not a member? 
                    <span className="sign-link" onClick={onRegisterClick}>Register now</span>
                </div>
            </div>
        </div>
    )
}

export default Sign;
