import { useState, useEffect } from 'react';
import Navbar from "./components/Navbar.jsx";
import Content from "./components/Content.jsx";
import Services from "./components/Services.jsx";
import WhyChooseUs from "./components/WhyChooseUs.jsx";
import Partner from "./components/Partner.jsx";
import Contactus from "./components/Contactus.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Sign from "./components/Sign.jsx";
import Register from "./components/Register.jsx";
import FoodDelivery from "./pages/FoodDelivery/FoodDelivery.jsx";
import GroceryDelivery from "./pages/GroceryDelivery/GroceryDelivery.jsx";
import MedicineDelivery from "./pages/MedicineDelivery/MedicineDelivery.jsx";
import CourierDelivery from "./pages/CourierDelivery/CourierDelivery.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Orders from "./pages/Orders/Orders.jsx";
import TrackOrder from "./pages/TrackOrder/TrackOrder.jsx";
import Payment from "./pages/Payment/Payment.jsx";
import PaymentSuccess from "./pages/Payment/PaymentSuccess.jsx";
import PaymentFailed from "./pages/Payment/PaymentFailed.jsx";
import PaymentHistory from "./pages/Payment/PaymentHistory.jsx";
import AIChatButton from "./components/AIChatButton.jsx";

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentFailure, setPaymentFailure] = useState(null);
  const [trackOrderId, setTrackOrderId] = useState(null);
  const [justPlaced, setJustPlaced] = useState(false);
  const [isDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleAIAction = (action, actionData) => {
    switch (action) {
      case 'NAVIGATE_FOOD':
        setCurrentView('food');
        break;
      case 'NAVIGATE_GROCERY':
        setCurrentView('grocery');
        break;
      case 'NAVIGATE_MEDICINE':
        setCurrentView('medicine');
        break;
      case 'NAVIGATE_COURIER':
        setCurrentView('courier');
        break;
      case 'NAVIGATE_PROFILE':
        setCurrentView('profile');
        break;
      case 'NAVIGATE_ORDERS':
        setCurrentView('orders');
        break;
      case 'NAVIGATE_CART':
        setCurrentView('cart');
        break;
      case 'NAVIGATE_SIGNIN':
        setCurrentView('signin');
        break;
      case 'NAVIGATE_TRACK_ORDER':
        if (actionData) {
          setTrackOrderId(Number(actionData));
          setJustPlaced(false);
          setCurrentView('track-order');
        } else {
          setCurrentView('orders');
        }
        break;
      default:
        break;
    }
  };

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
      {currentView === 'food' && (
        <FoodDelivery
          onBack={() => setCurrentView('home')}
          onGoToCart={() => setCurrentView('cart')}
        />
      )}
      {currentView === 'grocery' && (
        <GroceryDelivery
          onBack={() => setCurrentView('home')}
          onGoToCart={() => setCurrentView('cart')}
        />
      )}
      {currentView === 'medicine' && (
        <MedicineDelivery
          onBack={() => setCurrentView('home')}
          onGoToCart={() => setCurrentView('cart')}
        />
      )}
      {currentView === 'courier' && (
        <CourierDelivery
          onBack={() => setCurrentView('home')}
          onProceedToPayment={(session) => {
            setPaymentSession(session);
            setCurrentView('payment');
          }}
        />
      )}
      {currentView === 'profile' && (
        <UserProfile onBack={() => setCurrentView('home')} />
      )}
      {currentView === 'cart' && (
        <Cart
          onBack={() => setCurrentView('home')}
          onSignInClick={() => setCurrentView('signin')}
          onCheckout={(items) => {
            setCheckoutItems(items);
            setCurrentView('checkout');
          }}
        />
      )}
      {currentView === 'checkout' && (
        <Checkout
          items={checkoutItems}
          onBack={() => setCurrentView('cart')}
          onProceedToPayment={(session) => {
            setPaymentSession(session);
            setCurrentView('payment');
          }}
        />
      )}
      {currentView === 'payment' && (
        <Payment
          session={paymentSession}
          onBack={() => setCurrentView(paymentSession?.returnView || 'checkout')}
          onSuccess={(result) => {
            setPaymentResult(result);
            setPaymentFailure(null);
            setTrackOrderId(result?.order?.id ?? null);
            setJustPlaced(true);
            setCurrentView('payment-success');
          }}
          onFailed={(failure) => {
            setPaymentFailure(failure);
            setCurrentView('payment-failed');
          }}
        />
      )}
      {currentView === 'payment-success' && (
        <PaymentSuccess
          result={paymentResult}
          onTrackOrder={(orderId) => {
            setTrackOrderId(orderId);
            setCurrentView('track-order');
          }}
          onHistory={() => setCurrentView('payment-history')}
          onHome={() => setCurrentView('home')}
        />
      )}
      {currentView === 'payment-failed' && (
        <PaymentFailed
          failure={paymentFailure}
          onRetry={() => setCurrentView('payment')}
          onBackToCart={() => setCurrentView('cart')}
        />
      )}
      {currentView === 'payment-history' && (
        <PaymentHistory
          onBack={() => setCurrentView('home')}
          onSignInClick={() => setCurrentView('signin')}
        />
      )}
      {currentView === 'track-order' && (
        <TrackOrder
          orderId={trackOrderId}
          justPlaced={justPlaced}
          onBack={() => {
            setJustPlaced(false);
            setCurrentView('orders');
          }}
          onReorderComplete={() => {
            setJustPlaced(false);
            setCurrentView('cart');
          }}
        />
      )}
      {currentView === 'orders' && (
        <Orders
          onBack={() => setCurrentView('home')}
          onSignInClick={() => setCurrentView('signin')}
          onTrackOrder={(orderId) => {
            setTrackOrderId(orderId);
            setCurrentView('track-order');
          }}
        />
      )}
      {currentView === 'home' && (
        <>
          <Navbar
            onSignInClick={() => setCurrentView('signin')}
            onProfileClick={() => setCurrentView('profile')}
            onCartClick={() => setCurrentView('cart')}
            onOrdersClick={() => setCurrentView('orders')}
          />
          <main className="main-content">
            <Content />
            <Services
              onFoodOpen={() => setCurrentView('food')}
              onGroceryOpen={() => setCurrentView('grocery')}
              onMedicineOpen={() => setCurrentView('medicine')}
              onCourierOpen={() => setCurrentView('courier')}
            />
            <WhyChooseUs />
            <section className="info-section">
              <Partner />
            </section>
          </main>
          <Contactus />
          <ScrollToTop />
        </>
      )}
      <AIChatButton onAction={handleAIAction} />
    </>
  );
}

export default App;
