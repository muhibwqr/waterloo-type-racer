import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SignUpFormProps {
  onSuccess: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const normalizedEmail = email.trim();
  const emailValid = normalizedEmail.toLowerCase().endsWith("@uwaterloo.ca");
  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (!passwordValid) return "weak";
    if (password.length >= 12 && /[!@#$%^&*]/.test(password)) return "strong";
    return "medium";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValid) {
      toast.error("Must use a @uwaterloo.ca email");
      return;
    }

    if (!usernameValid) {
      toast.error("Username must be 3-20 characters (letters, numbers, underscore only)");
      return;
    }

    if (!passwordValid) {
      toast.error("Password must be at least 8 characters with 1 uppercase and 1 number");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(normalizedEmail.toLowerCase(), password, username);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Email already registered");
      } else if (error.message.includes("username")) {
        toast.error("Username already taken");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Account created! Check your email for verification.");
      onSuccess();
      navigate("/verify-email");
    }

    setIsLoading(false);
  };

  const strength = getPasswordStrength();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground">UWaterloo Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@uwaterloo.ca"
          required
          className={`h-12 bg-input border-2 ${
            email && emailValid ? 'border-primary' : email ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
        />
        {email && !emailValid && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="w-4 h-4" /> Must be a @uwaterloo.ca email
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-username" className="text-foreground">Username</Label>
        <Input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="WaterlooWarrior"
          required
          className={`h-12 bg-input border-2 ${
            username && usernameValid ? 'border-primary' : username ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
        />
        {username && (
          <p className={`text-sm flex items-center gap-1 ${usernameValid ? 'text-primary' : 'text-muted-foreground'}`}>
            {usernameValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            3-20 chars, alphanumeric + underscore only
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          className="h-12 bg-input border-border focus:border-primary"
        />
        {password && (
          <>
            <div className="flex gap-1 h-1">
              <div className={`flex-1 rounded ${strength ? 'bg-destructive' : 'bg-muted'}`} />
              <div className={`flex-1 rounded ${strength === 'medium' || strength === 'strong' ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex-1 rounded ${strength === 'strong' ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <p className="text-sm text-muted-foreground">
              Min 8 chars, 1 uppercase, 1 number
            </p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm" className="text-foreground">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
          className={`h-12 bg-input border-2 ${
            confirmPassword && passwordsMatch ? 'border-primary' : confirmPassword ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Waterloo students only • Email verification required
      </p>
    </form>
  );
};

export default SignUpForm;
