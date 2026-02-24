import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import HealthRisk from "./pages/HealthRisk";
import Environment from "./pages/Environment";
import CarbonFootprint from "./pages/CarbonFootprint";
import DustbinLocator from "./pages/DustbinLocator";
import HospitalLocator from "./pages/HospitalLocator";
import Prescription from "./pages/Prescription";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health" element={<HealthRisk />} />
          <Route path="/environment" element={<Environment />} />
          <Route path="/carbon" element={<CarbonFootprint />} />
          <Route path="/dustbin" element={<DustbinLocator />} />
          <Route path="/hospital" element={<HospitalLocator />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
