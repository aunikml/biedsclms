import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline'
import { AppearanceProvider } from './context/AppearanceContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppearanceProvider>
      <CssBaseline />
      <App />
    </AppearanceProvider>
  </React.StrictMode>,
)
