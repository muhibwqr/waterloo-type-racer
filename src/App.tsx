import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Aurora from "@/components/Aurora";
import TypingTest from "@/pages/TypingTest";
import Leaderboard from "@/pages/LeaderboardPage";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import EmailVerification from "@/pages/EmailVerification";
import AdminApprovalAuth from "@/pages/AdminApprovalAuth";
import AdminApprovalDashboard from "@/pages/AdminApprovalDashboard";
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
          <div className="min-h-screen bg-background flex flex-col relative">
            <Aurora 
              colorStops={['#0ea5e9', '#06b6d4', '#8b5cf6']}
              amplitude={1.2}
              blend={0.6}
              speed={0.8}
            />
            <Navigation />
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<TypingTest />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile/:username?" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/admin-approval-auth" element={<AdminApprovalAuth />} />
                <Route path="/admin-approval-auth/dashboard" element={<AdminApprovalDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
