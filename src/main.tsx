import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeDatabase } from './db'

// Initialize database on app start
initializeDatabase().catch(console.error)

// Ignore CORS errors from external sources (browser extensions, etc.)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Ignore CORS errors from external domains (not our app)
    if (event.message && (
      event.message.includes('CORS') ||
      event.message.includes('dlnk.one') ||
      event.message.includes('Access-Control-Allow-Origin')
    )) {
      event.preventDefault()
      return false
    }
  }, true)

  // Also catch unhandled promise rejections from external sources
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'object') {
      const reason = String(event.reason.message || event.reason)
      if (reason.includes('CORS') || reason.includes('dlnk.one')) {
        event.preventDefault()
        return false
      }
    }
  })
}

// Service worker will be registered by Vite PWA plugin

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
