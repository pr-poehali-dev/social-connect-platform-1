import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dating from "./pages/Dating";
import Ads from "./pages/Ads";
import Services from "./pages/Services";
import Referral from "./pages/Referral";
import Wallet from "./pages/Wallet";
import VkCallback from "./pages/VkCallback";
import YandexCallback from "./pages/YandexCallback";
import GoogleCallback from "./pages/GoogleCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dating" element={<Dating />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/services" element={<Services />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/auth/vk/callback" element={<VkCallback />} />
          <Route path="/auth/yandex/callback" element={<YandexCallback />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;