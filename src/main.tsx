import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((error) => {
        console.log("SW registration failed:", error);
      });
  });
}

// Handle PWA install prompt
let deferredPrompt: any;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
