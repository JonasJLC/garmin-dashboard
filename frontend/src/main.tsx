import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-dvh bg-background text-foreground font-sans antialiased">
      <App />
    </div>
  </StrictMode>,
)
