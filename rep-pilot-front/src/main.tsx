import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ToastContainer } from "./shared/ui/Toast/ToastContainer.tsx";
import { LanguageProvider } from "./shared/lib/i18n/LanguageContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <ToastContainer />
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
