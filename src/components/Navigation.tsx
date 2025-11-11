import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl bg-background/80 border-b border-border-subtle">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center shadow-gold-glow">
            <Zap className="w-5 h-5 text-gold-foreground" fill="currentColor" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gold to-foreground bg-clip-text text-transparent">
            WaterlooType
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-foreground-muted hover:text-gold transition-colors duration-200"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('leaderboard')}
            className="text-foreground-muted hover:text-gold transition-colors duration-200"
          >
            Leaderboard
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-foreground-muted hover:text-gold transition-colors duration-200"
          >
            How It Works
          </button>
        </div>

        {/* Sign In Button */}
        <Button
          variant="outline"
          className="border-gold text-gold hover:bg-gold hover:text-gold-foreground transition-all duration-300"
        >
          Sign In
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
