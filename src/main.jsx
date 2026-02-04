import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initYandexMetrika } from './utils/yandexMetrika';

// Initialize Yandex Metrika
initYandexMetrika();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
