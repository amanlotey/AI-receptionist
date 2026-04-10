import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { TranscriptProvider } from "../src/context/TranscriptContext"; // ✅ Import provider
import { AudioRecorderProvider } from "./context/AudioRecorderContext";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-wskq6pw8r4hg232m.us.auth0.com"
      clientId="lEuPx6JhJmlm1EO8UAhwN7bnVpEHj2Rf"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <AudioRecorderProvider>
        <TranscriptProvider>
          <App />
        </TranscriptProvider>
      </AudioRecorderProvider>
    </Auth0Provider>
  </React.StrictMode>
);
