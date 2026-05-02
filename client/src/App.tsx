import { ThemeProvider } from "@/modules/website/components/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "@/components/ScrollToTop";
import AppRoutes from "./routes/index";
import { SsrDataProvider, useSsrData } from "./ssr/SsrDataContext";
import { applySeoToDocument, fetchGlobalSeo } from "@/lib/seo";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WhatsAppButton from "@/modules/website/components/WhatsAppButton";

function GlobalSeoManager() {
  const location = useLocation();
  const { globalSeo } = useSsrData();

  useEffect(() => {
    const pathname = location.pathname;
    const isPropertyDetailRoute = /^\/[^/]+\/[^/]+-\d+\/?$/.test(pathname);
    let isMounted = true;

    if (!isPropertyDetailRoute) {
      fetchGlobalSeo(pathname)
        .then((seo) => {
          if (!isMounted) return;
          applySeoToDocument(seo || { metaTag: null, googleTag: null });
        })
        .catch(() => {
          if (!isMounted) return;
          const fallbackSeo = globalSeo || { metaTag: null, googleTag: null };
          applySeoToDocument(fallbackSeo);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [globalSeo, location.pathname]);

  return null;
}

function App({ initialData = {} }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SsrDataProvider initialData={initialData}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <GlobalSeoManager />
            <Toaster />
            <ScrollToTop />
            <ToastContainer />
            <WhatsAppButton />
            {mounted && <ToastContainer />}
            <AppRoutes />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SsrDataProvider>
  );
}

export default App;
