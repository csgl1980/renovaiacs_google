import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from "./src/pages/LoginPage";
import { SessionContextProvider } from './src/components/SessionContextProvider';
import AuthRedirector from './src/components/AuthRedirector';
import AdminPage from './src/pages/AdminPage'; // Ensure AdminPage is imported

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SessionContextProvider>
      <Router>
        <Routes>
          {/* AuthRedirector handles initial session check and redirects to /app or /login */}
          <Route path="/" element={<AuthRedirector />} /> 
          <Route path="/login" element={<LoginPage />} />
          {/* App is rendered only if authenticated, nested under /app */}
          <Route path="/app/*" element={<App />} /> 
          {/* Admin page is also protected by AuthRedirector, but accessed directly */}
          <Route path="/admin" element={<AdminPage />} /> 
        </Routes>
      </Router>
    </SessionContextProvider>
  </React.StrictMode>
);