import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID loaded:', clientId ? `${clientId.substring(0, 10)}...` : 'MISSING');

createRoot(rootElement).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </StrictMode>,
)
