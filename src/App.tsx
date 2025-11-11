import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import TypingTest from "@/pages/TypingTest";
import Leaderboard from "@/pages/LeaderboardPage";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import EmailVerification from "@/pages/EmailVerification";
import NotFound from "@/pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<TypingTest />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile/:username?" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
