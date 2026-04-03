import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="dark min-h-dvh">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </div>
  </StrictMode>,
);
