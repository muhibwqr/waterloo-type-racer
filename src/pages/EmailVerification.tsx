import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EmailVerification = () => {
  const { user, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) {
      toast.error("No email address found");
      return;
    }

    setIsResending(true);
    const { error } = await resendVerification();
    
    if (error) {
      console.error("Resend verification error:", error);
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
              We sent a verification link to <br />
              <span className="text-foreground font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>Click the link in your email to activate your account and join the leaderboard.</p>
            <p className="text-sm">You can still use the typing test, but can't save scores or compete until verified.</p>
          </div>

          <Button
            onClick={handleResend}
            disabled={isResending}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {isResending ? "Sending..." : "Didn't receive it? Resend verification email"}
          </Button>

          <div className="pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>After verifying, you'll be automatically signed in</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EmailVerification;
