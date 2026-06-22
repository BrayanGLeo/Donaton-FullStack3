import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.tsx'

document.addEventListener('keydown', (e) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    if (e.key === ' ' && target.selectionStart === 0) {
      e.preventDefault();
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
