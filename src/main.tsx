import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MetaCallback from './pages/MetaCallback.tsx'

const isCallback = window.location.pathname === '/meta-callback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCallback ? <MetaCallback /> : <App />}
  </StrictMode>,
)
