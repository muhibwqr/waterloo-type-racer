import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EmailVerification = () => {
  const { user, session, loading, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);

  // Get email from user or session
  const userEmail = user?.email || session?.user?.email;

  // If user is already verified, redirect to home
  useEffect(() => {
    if (user?.email_confirmed_at) {
      toast.success("Email already verified! Redirecting...");
      navigate("/");
    }
  }, [user, navigate]);

  const handleResend = async () => {
    // Wait for auth to finish loading
    if (loading) {
      toast.info("Please wait while we check your account...");
      return;
    }

    if (!userEmail) {
      toast.error("Unable to find your email address. Please try signing out and signing back in.");
      return;
    }

    setIsResending(true);
    const { error } = await resendVerification();
    
    if (error) {
      toast.error(error.message || "Failed to resend email. Please try again.");
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
    
    setIsResending(false);
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Verify Your Email</h1>
            <p className="text-lg text-muted-foreground">
              {loading ? (
                "Loading your account..."
              ) : userEmail ? (
                <>
                  We sent a verification link to <br />
                  <span className="text-foreground font-semibold">{userEmail}</span>
                </>
              ) : (
                "Unable to load your email address. Please try signing out and signing back in."
              )}
            </p>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>Click the link in your email to activate your account. You'll be automatically signed in and can start using the app right away!</p>
            <p className="text-sm">You can still use the typing test, but can't upload scores until verified.</p>
          </div>

          <Button
            onClick={handleResend}
            disabled={isResending || loading || !userEmail}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {loading 
              ? "Loading..." 
              : isResending 
              ? "Sending..." 
              : !userEmail
              ? "Email not available"
              : "Didn't receive it? Resend verification email"}
          </Button>

          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>After verifying, you'll be automatically signed in and redirected to the app</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmailVerification;
