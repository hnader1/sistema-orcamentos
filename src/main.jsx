import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const hash = window.location.hash
if (hash && hash.includes('access_token')) {
  sessionStorage.setItem('supabase-auth-hash', hash)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)