import { createRoot } from "react-dom/client";
import 'leaflet/dist/leaflet.css';
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <App />
        </TooltipProvider>
      </QueryClientProvider>
    </AppProvider>
  </BrowserRouter>
);