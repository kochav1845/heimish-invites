import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Use React.lazy for code splitting
const root = createRoot(document.getElementById('root')!);

root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);