import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '8px',
            padding: '10px 16px',
          },
          success: {
            iconTheme: { primary: '#2563EB', secondary: '#1a1a1a' },
            style: {
              borderLeft: '4px solid #2563EB',
            }
          },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1a1a1a' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
