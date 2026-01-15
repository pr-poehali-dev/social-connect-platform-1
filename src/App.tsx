import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Dating from "./pages/Dating";
import Ads from "./pages/Ads";
import AdsMan from "./pages/AdsMan";
import MyAds from "./pages/MyAds";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Events from "./pages/Events";
import MyEvents from "./pages/MyEvents";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Favorites from "./pages/Favorites";
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
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/:nickname" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/dating" element={<ProtectedRoute><Dating /></ProtectedRoute>} />
          <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
          <Route path="/adsman" element={<ProtectedRoute><AdsMan /></ProtectedRoute>} />
          <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/services/:nickname" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
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