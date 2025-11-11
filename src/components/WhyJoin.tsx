import { Trophy, Zap, TrendingUp, Lock } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Live Typing Sprints",
    description: "Compete in real-time races tailored to Waterloo life"
  },
  {
    icon: Zap,
    title: "Earn Badges & Rankings",
    description: "Flex your typing speed with friends on the leaderboard"
  },
  {
    icon: TrendingUp,
    title: "Track Performance",
    description: "Monitor your WPM, accuracy, and reaction heatmaps"
  },
  {
    icon: Lock,
    title: "100% Free for Warriors",
    description: "Magic link only, no password stress, forever free"
  }
];

const WhyJoin = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Join WaterlooType?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-card-elevated p-8 rounded-xl border border-border-subtle hover:border-gold hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mb-6 shadow-gold-glow group-hover:shadow-gold-glow-lg transition-shadow duration-300">
                  <Icon className="w-8 h-8 text-gold-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyJoin;
