import { useState } from 'react';
import Navbar from "./components/Navbar.jsx";
import Content from "./components/Content.jsx";
import Services from "./components/Services.jsx";
import Delivery from "./components/Delivery.jsx";
import Partner from "./components/Partner.jsx";
import Contactus from "./components/Contactus.jsx";
import Sign from "./components/Sign.jsx";
import Register from "./components/Register.jsx";

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'signin', 'register'

  return (
    <>
      {currentView === 'signin' && (
        <Sign 
          onBack={() => setCurrentView('home')} 
          onRegisterClick={() => setCurrentView('register')}
        />
      )}
      {currentView === 'register' && (
        <Register 
          onBack={() => setCurrentView('home')}
          onSignInClick={() => setCurrentView('signin')}
        />
      )}
      {currentView === 'home' && (
        <>
          <div className="total">
            <Navbar onSignInClick={() => setCurrentView('signin')} />
            <Content />
            <Services/>
          </div>
          <div className="bottom-row" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
            <Delivery/>
            <Partner/>
          </div>
          <Contactus />
        </>
      )}
    </>

  );
}
export default App;