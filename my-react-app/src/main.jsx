import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installAuthFetch } from './services/apiAuth.js'

// Attach the JWT to every Anywhere API call (cart, orders, payment, profile,
// AI, courier tracking) before anything renders. Third-party hosts are skipped.
installAuthFetch()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
