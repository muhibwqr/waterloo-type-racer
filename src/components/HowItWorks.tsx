import { Mail, Zap, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Enter Your @uwaterloo.ca Email",
    description: "Sign up with your official UWaterloo email address. We verify you're a real Warrior.",
    time: "Takes 5 seconds"
  },
  {
    number: "02",
    icon: Zap,
    title: "Receive Instant Magic Link",
    description: "Check your inbox for a secure magic link. No passwords to remember, ever.",
    time: "Arrives instantly"
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start Racing on WaterlooType",
    description: "Jump into live typing races, compete on the leaderboard, and earn exclusive badges.",
    time: "Jump right in"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-foreground-muted text-lg">Get started in seconds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-background-card p-8 rounded-xl border border-border-subtle hover:border-gold hover:scale-105 transition-all duration-300 group"
              >
                {/* Floating Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center font-bold text-gold-foreground shadow-gold-glow">
                  {step.number}
                </div>

                <div className="space-y-4 mt-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gold" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold">{step.title}</h3>

                  {/* Description */}
                  <p className="text-foreground-muted">{step.description}</p>

                  {/* Divider & Time */}
                  <div className="pt-4 border-t border-border-subtle">
                    <span className="text-sm text-foreground-muted">{step.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
