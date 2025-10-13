import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Attendre que le DOM soit prêt
const renderApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement && !rootElement.hasAttribute('data-react-root')) {
    rootElement.setAttribute('data-react-root', 'true');
    createRoot(rootElement).render(<App />);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
