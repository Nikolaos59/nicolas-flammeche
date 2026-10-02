import React from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingBag, X } from 'lucide-react';
import './App.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

