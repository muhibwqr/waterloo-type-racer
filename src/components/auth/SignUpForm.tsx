import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { isValidEmailDomain } from "@/constants/validEmailDomains";

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
  const [schoolName, setSchoolName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const normalizedEmail = email.trim();
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.toLowerCase());
  const emailDomainValid = emailFormatValid && isValidEmailDomain(normalizedEmail);
  const usernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const schoolNameValid = schoolName.length >= 2 && schoolName.length <= 100;

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (!passwordValid) return "weak";
    if (password.length >= 12 && /[!@#$%^&*]/.test(password)) return "strong";
    return "medium";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailFormatValid) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!emailDomainValid) {
      toast.error("Please use a valid university email address");
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

    if (!schoolNameValid) {
      toast.error("Please enter your school name (2-100 characters)");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(normalizedEmail.toLowerCase(), password, username, schoolName, null);

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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground text-sm sm:text-base">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className={`h-10 sm:h-12 text-sm sm:text-base bg-input border-2 ${
            email && emailDomainValid ? 'border-primary' : email ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
        />
        {email && !emailFormatValid && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="w-4 h-4" /> Please enter a valid email address
          </p>
        )}
        {email && emailFormatValid && !emailDomainValid && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="w-4 h-4" /> Please use a valid university email address
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-username" className="text-foreground text-sm sm:text-base">Username</Label>
        <Input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="YourUsername"
          required
          className={`h-10 sm:h-12 text-sm sm:text-base bg-input border-2 ${
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
        <Label htmlFor="signup-school" className="text-foreground text-sm sm:text-base">School Name</Label>
        <Input
          id="signup-school"
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="University of Example"
          required
          className={`h-10 sm:h-12 text-sm sm:text-base bg-input border-2 ${
            schoolName && schoolNameValid ? 'border-primary' : schoolName ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
        />
        {schoolName && !schoolNameValid && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <X className="w-4 h-4" /> School name must be 2-100 characters
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground text-sm sm:text-base">Password</Label>
        <Input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          className="h-10 sm:h-12 text-sm sm:text-base bg-input border-border focus:border-primary"
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
        <Label htmlFor="signup-confirm" className="text-foreground text-sm sm:text-base">Confirm Password</Label>
        <Input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
          className={`h-10 sm:h-12 text-sm sm:text-base bg-input border-2 ${
            confirmPassword && passwordsMatch ? 'border-primary' : confirmPassword ? 'border-destructive' : 'border-border'
          } focus:border-primary`}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 sm:h-12 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
        Open to university students • Verify your email to get started
      </p>
    </form>
  );
};

export default SignUpForm;
