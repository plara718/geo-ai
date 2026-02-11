import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary'; // ★追加
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {' '}
      {/* ★追加 */}
      <App />
    </ErrorBoundary>{' '}
    {/* ★追加 */}
  </React.StrictMode>
);
