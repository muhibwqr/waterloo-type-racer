import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Iridescence from "@/components/Iridescence";
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
            <Iridescence 
              color={[0.55, 0.42, 0.96]}
              speed={1.0}
              amplitude={0.1}
              mouseReact={true}
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
