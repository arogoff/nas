import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "./components/ToastProvider";
import { HeroUIProvider } from "@heroui/system";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <HeroUIProvider>
          <App />
        </HeroUIProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);