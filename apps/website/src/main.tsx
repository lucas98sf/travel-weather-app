import ReactDOM from "react-dom/client";
import { RelayEnvironmentProvider } from "react-relay";
import { App } from "./App.js";
import { relayEnvironment } from "./lib/relay.js";
import "./styles.css";

ReactDOM.createRoot(document.querySelector("#app")!).render(
  <RelayEnvironmentProvider environment={relayEnvironment}>
    <App />
  </RelayEnvironmentProvider>,
);
