import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from "./src/pages/LoginPage"; // Caminho corrigido
import { SessionContextProvider } from './src/components/SessionContextProvider'; // Caminho corrigido

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </Router>
    </SessionContextProvider>
  </React.StrictMode>
);