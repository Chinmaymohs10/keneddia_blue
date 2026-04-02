import { BrowserRouter } from "react-router-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "@/lib/leafletIconFix";
import "./index.css";
import { loadInitialDataForUrl } from "@/ssr/loadInitialData";

const container = document.getElementById("root");

async function bootstrap() {
  if (!container) {
    return;
  }

  const hasSsrMarkup = container.hasChildNodes();
  const initialData = hasSsrMarkup
    ? await loadInitialDataForUrl(window.location.href).catch(() => null)
    : null;
  const app = (
    <BrowserRouter>
      <App initialData={initialData} />
    </BrowserRouter>
  );

  if (hasSsrMarkup) {
    hydrateRoot(container, app);
    return;
  }

  createRoot(container).render(app);
}

bootstrap();
