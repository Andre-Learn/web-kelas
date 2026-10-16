import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/public.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ContentProvider>
          <AuthProvider>
            {/* reducedMotion="user" turns transforms off when the OS asks for less motion. */}
            <MotionConfig reducedMotion="user">
              <LazyMotion features={domAnimation} strict>
                <App />
              </LazyMotion>
            </MotionConfig>
          </AuthProvider>
        </ContentProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
