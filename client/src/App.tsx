import { ThemeProvider } from "@/modules/website/components/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "@/components/ScrollToTop";
import AppRoutes from "./routes/index";
import { SsrDataProvider } from "./ssr/SsrDataContext";

function App({ initialData = {} }) {
  return (
    <SsrDataProvider initialData={initialData}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
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
