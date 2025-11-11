import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-card border border-border-subtle">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-foreground-secondary">1,247 Warriors typing now</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-foreground via-gold to-gold bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
              Type Faster.
            </span>
            <br />
            <span className="text-gold">Beat Waterloo.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl">
            Real-time typing races, competitive leaderboards, and exclusive badges for UWaterloo students only
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
            >
              Start Racing Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:border-gold hover:text-gold transition-all duration-300 text-lg px-8 py-6"
            >
              Watch Demo →
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gold rounded-full" />
              <span>~30s onboarding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gold rounded-full" />
              <span>100% free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-gold rounded-full" />
              <span>UWaterloo verified</span>
            </div>
          </div>

          {/* Scroll Arrow */}
          <div className="pt-12 animate-bounce-slow">
            <ArrowDown className="w-6 h-6 text-gold" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
