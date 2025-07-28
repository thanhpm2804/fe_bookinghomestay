import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/globals.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="438362658712-jdshqi86s6btponqp4nl6in0pg6njfkn.apps.googleusercontent.com">
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
