import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle Supabase auth hash BEFORE React renders
const hash = window.location.hash
if (hash && hash.includes('access_token')) {
  // Store the hash temporarily
  sessionStorage.setItem('supabase-auth-hash', hash)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)