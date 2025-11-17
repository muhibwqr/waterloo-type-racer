import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SignInFormProps {
  onSuccess: () => void;
}

const SignInForm = ({ onSuccess }: SignInFormProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in");
      } else if (error.message.includes("Invalid") || error.message.includes("username")) {
        toast.error("Invalid email/username or password");
      } else {
        toast.error(error.message);
      }
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="signin-email" className="text-foreground">Email or Username</Label>
        <Input
          id="signin-email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@uwaterloo.ca or username"
          required
          className="h-12 bg-input border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password" className="text-foreground">Password</Label>
          <button type="button" className="text-sm text-muted-foreground hover:text-primary">
            Forgot password?
          </button>
        </div>
        <Input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          className="h-12 bg-input border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default SignInForm;
