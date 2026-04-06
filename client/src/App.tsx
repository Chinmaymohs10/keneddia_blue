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
import { applySeoToDocument } from "@/lib/seo";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function GlobalSeoManager() {
  const location = useLocation();
  const { globalSeo } = useSsrData();

  useEffect(() => {
    const pathname = location.pathname;
    const isPropertyDetailRoute = /^\/[^/]+\/[^/]+-\d+\/?$/.test(pathname);

    if (!isPropertyDetailRoute) {
      applySeoToDocument(globalSeo || { metaTag: null, googleTag: null });
    }
  }, [globalSeo, location.pathname]);

  return null;
}

function App({ initialData = {} }) {
  return (
    <SsrDataProvider initialData={initialData}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <GlobalSeoManager />
            <Toaster />
            <ScrollToTop />
            <ToastContainer />
            <AppRoutes />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SsrDataProvider>
  );
}

export default App;
