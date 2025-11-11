import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Ticket, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("");
      return false;
    }
    
    if (!email.endsWith("@uwaterloo.ca")) {
      setEmailError("Must be a @uwaterloo.ca email");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid @uwaterloo.ca email");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Magic link sent! Check your inbox.");
      setEmail("");
      setReferral("");
    }, 2000);
  };

  return (
    <section id="signup" className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto bg-card-elevated p-12 rounded-3xl shadow-deep-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground-secondary">
                Waterloo Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@uwaterloo.ca"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateEmail(e.target.value);
                  }}
                  className={`h-14 pl-12 bg-input border-2 ${
                    emailError 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-input-border focus:border-gold focus:shadow-gold-glow'
                  } transition-all duration-300`}
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
              <p className="text-sm text-foreground-muted">
                We'll send a magic link to your @uwaterloo.ca inbox
              </p>
            </div>

            {/* Referral Input */}
            <div className="space-y-2">
              <Label htmlFor="referral" className="text-foreground-secondary">
                Referral (optional)
              </Label>
              <div className="relative">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <Input
                  id="referral"
                  type="text"
                  placeholder="Enter referral code"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  className="h-14 pl-12 bg-input border-2 border-input-border focus:border-gold focus:shadow-gold-glow transition-all duration-300"
                />
              </div>
              <p className="text-sm text-foreground-muted">
                Have a referral code? Enter it here for bonus perks
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gold text-gold-foreground hover:bg-gold/90 font-bold text-lg shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-[1.02] transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                'Get Started Free'
              )}
            </Button>

            <p className="text-center text-sm text-foreground-muted">
              Waterloo students only • Magic link authentication • Powered by Supabase
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;
