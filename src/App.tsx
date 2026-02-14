import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { RadioProvider } from "./contexts/RadioContext";
import { OfflineIndicator } from "./components/OfflineIndicator";
import AiAssistantChat from "./components/AiAssistantChat";
import DimaChat from "./components/DimaChat";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Dating from "./pages/Dating";
import DatingProfile from "./pages/DatingProfile";
import Ads from "./pages/Ads";
import MyAds from "./pages/MyAds";
import CreateAd from "./pages/CreateAd";
import Applications from "./pages/Applications";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import MyServices from "./pages/MyServices";
import AddService from "./pages/AddService";
import Events from "./pages/Events";
import SelectCity from "./pages/SelectCity";
import MyEvents from "./pages/MyEvents";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Favorites from "./pages/Favorites";
import Referral from "./pages/Referral";
import Wallet from "./pages/Wallet";
import VkCallback from "./pages/VkCallback";
import YandexCallback from "./pages/YandexCallback";
import GoogleCallback from "./pages/GoogleCallback";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSections from "./pages/admin/AdminSections";
import AdminFilters from "./pages/admin/AdminFilters";
import AdminLogs from "./pages/admin/AdminLogs";
import Notifications from "./pages/Notifications";
import CallHistory from "./pages/CallHistory";
import Radio from "./pages/Radio";
import VerificationRequest from "./pages/VerificationRequest";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminPrices from "./pages/admin/AdminPrices";
import Premium from "./pages/Premium";
import Settings from "./pages/Settings";
import OlesyaProfile from "./pages/OlesyaProfile";
import DimaProfile from "./pages/DimaProfile";
import MafiaLobby from "./pages/MafiaLobby";
import MafiaGame from "./pages/MafiaGame";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RadioProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/ref/:code" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/:nickname" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/dating" element={<ProtectedRoute><Dating /></ProtectedRoute>} />
          <Route path="/dating/olesya-ai" element={<ProtectedRoute><OlesyaProfile /></ProtectedRoute>} />
          <Route path="/dating/dima-ai" element={<ProtectedRoute><DimaProfile /></ProtectedRoute>} />
          <Route path="/dating/:userId" element={<ProtectedRoute><DatingProfile /></ProtectedRoute>} />
          <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
          <Route path="/my-ads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
          <Route path="/create-ad" element={<ProtectedRoute><CreateAd /></ProtectedRoute>} />
          <Route path="/applications/:adId" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/my-services" element={<ProtectedRoute><MyServices /></ProtectedRoute>} />
          <Route path="/add-service" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
          <Route path="/edit-service/:id" element={<ProtectedRoute><AddService /></ProtectedRoute>} />
          <Route path="/services/:nickname" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/select-city" element={<ProtectedRoute><SelectCity /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/vk-callback" element={<VkCallback />} />
          <Route path="/yandex-callback" element={<YandexCallback />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/call-history" element={<ProtectedRoute><CallHistory /></ProtectedRoute>} />
          <Route path="/radio" element={<ProtectedRoute><Radio /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sections" element={<AdminSections />} />
          <Route path="/admin/filters" element={<AdminFilters />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/prices" element={<AdminPrices />} />
          <Route path="/verification-request" element={<ProtectedRoute><VerificationRequest /></ProtectedRoute>} />
          <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/mafia" element={<ProtectedRoute><MafiaLobby /></ProtectedRoute>} />
          <Route path="/mafia/:roomId" element={<ProtectedRoute><MafiaGame /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      <AiAssistantChat />
      <DimaChat />

      </BrowserRouter>
      </RadioProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;