function App() {
    const [currentTab, setCurrentTab] = React.useState('courier'); // 'courier', 'profile', 'checkout', 'assistant'
    const [user, setUser] = React.useState(() => window.authApi.userId() ? window.authApi.user() : null);
    const [signInOpen, setSignInOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const pendingAction = React.useRef(null);

    React.useEffect(() => {
        const expired = () => { setUser(null); setMessage('Session expired, please sign in again'); setSignInOpen(true); };
        window.addEventListener('anywhere:session-expired', expired);
        return () => window.removeEventListener('anywhere:session-expired', expired);
    }, []);

    const requireAuth = (action) => {
        const hadToken = Boolean(window.authApi.token());
        if (window.authApi.userId()) return action();
        pendingAction.current = action;
        setMessage(hadToken ? 'Session expired, please sign in again' : 'Please sign in to place an order');
        setSignInOpen(true);
    };
    const signOut = () => { window.authApi.clear(); setUser(null); setCurrentTab('courier'); };
    const signedIn = (nextUser) => { setUser(nextUser); setSignInOpen(false); const action = pendingAction.current; pendingAction.current = null; if (action) action(); };

    return (
        <div className="page-wrapper">
            <header className="page-header">
                <div className="header-brand">
                    <h1>Anywhere</h1>
                    <span className="badge-tag">Tamil Nadu</span>
                </div>
                <nav className="header-nav">
                    {user ? <><span className="nav-item">Hi, {user.fullName || user.name || 'Customer'}</span><button className="nav-item" onClick={signOut}>Sign out</button></> :
                        <button className="nav-item" onClick={() => { setMessage(''); setSignInOpen(true); }}>Sign in</button>}
                    <button
                        className={`nav-item ${currentTab === 'courier' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('courier')}
                    >
                        📦 Courier
                    </button>
                    <button
                        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('profile')}
                    >
                        👤 Profile Addresses
                    </button>
                    <button
                        className={`nav-item ${currentTab === 'checkout' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('checkout')}
                    >
                        🛒 Checkout Address
                    </button>
                    <button
                        className={`nav-item ${currentTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('orders')}
                    >
                        🧾 Orders & Ratings
                    </button>
                    <button className={`nav-item ${currentTab === 'tracking' ? 'active' : ''}`} onClick={() => setCurrentTab('tracking')}>📍 Track order</button>
                    <button className={`nav-item ${currentTab === 'assistant' ? 'active' : ''}`} onClick={() => setCurrentTab('assistant')}>✨ AI Assistant</button>
                </nav>
            </header>

            <main className="page-main">
                {currentTab === 'courier' && <CourierBooking requireAuth={requireAuth} />}
                {currentTab === 'profile' && <ProfileAddressEntry userId={user?.id} />}
                {currentTab === 'checkout' && <CheckoutAddressSelection userId={user?.id} />}
                {currentTab === 'orders' && <RatingWidget userId={user?.id} />}
                {currentTab === 'tracking' && <OrderTracking />}
                {currentTab === 'assistant' && <AiAssistant user={user} />}
            </main>
            {signInOpen && <SignIn message={message} onSuccess={signedIn} onClose={() => setSignInOpen(false)} />}

            <footer className="page-footer">
                <p>&copy; 2025 Anywhere. 38 Districts, One Curated Platform.</p>
            </footer>
        </div>
    );
}

function SignIn({ message, onSuccess, onClose }) {
    const [email, setEmail] = React.useState(''); const [password, setPassword] = React.useState(''); const [error, setError] = React.useState('');
    const submit = async (e) => { e.preventDefault(); setError(''); try {
        const response = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, password}) });
        if (!response.ok) throw new Error(await response.text() || 'Sign in failed');
        const data = await response.json();
        if (!data.token || !Number.isInteger(Number(data.id)) || Number(data.id) <= 0)
            throw new Error('Sign in did not return a valid session identity');
        localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data)); onSuccess(data);
    } catch (err) { setError(err.message); } };
    return <div className="courier-card" style={{position:'fixed', zIndex:1000, top:'15%', left:'50%', transform:'translateX(-50%)', width:'360px'}}>
        <button className="btn" style={{float:'right'}} onClick={onClose}>×</button><h2>Sign in</h2>{message && <p className="location-status-msg info">{message}</p>}
        <form onSubmit={submit}><input className="form-control" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="form-control" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{marginTop:'10px'}} />
        {error && <p className="location-status-msg error">{error}</p>}<button className="btn btn-primary" style={{marginTop:'12px'}} type="submit">Sign in</button></form></div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
