import "./global.css";
import "./builder.register";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MapboxTest from "@/components/app/MapboxTest";
import MapZonePicker from "@/components/app/MapZonePicker";
import SatelliteMeasure from "@/components/app/SatelliteMeasure";
import LiveUpdates from "@/components/app/LiveUpdates";
import SyncNowButton from "@/components/app/SyncNowButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mapbox-test" element={<MapboxTest />} />
          <Route path="/map" element={<MapZonePicker />} />
          <Route path="/leaflet" element={<SatelliteMeasure />} />
          <Route path="/live-updates" element={<div className="p-4 space-y-4"><SyncNowButton onSync={() => fetch('/api/ping').then(()=>{})} /><LiveUpdates /></div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
