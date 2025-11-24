import { Button } from "@/components/ui/button";
import { Trophy, Zap, BarChart3, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: Trophy,
      title: "University Leaderboard",
      description: "See which university has the fastest typers. Rankings are based on average WPM across all submissions from each university.",
    },
    {
      icon: Zap,
      title: "Timed Typing Tests",
      description: "Test your speed with 15s, 30s, or 60s challenges. Submit your best scores to represent your university.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track your WPM, accuracy, and performance over time with real-time statistics and performance graphs.",
    },
    {
      icon: Lock,
      title: "Open to All",
      description: "No sign-up required. Simply select your university and start typing. See how your school ranks against others.",
    },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 space-y-6">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            <span className="text-foreground">Type Faster. </span>
            <span className="text-primary">Beat Everyone.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Open to all university students and graduates. Compete to see which university has the best typers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
                Start Typing Now
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:border-primary hover:text-primary text-lg px-8 py-6"
              >
                View Leaderboard →
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Why Join GooseType?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6 py-16 border-t border-border">
          <div className="text-6xl text-primary mb-4">"</div>
          <blockquote className="text-2xl italic text-foreground">
            GooseType turned our study sessions into a friendly competition. The leaderboard keeps us
            motivated—shoutout to the Diamond tier grinders!
          </blockquote>
          <p className="text-muted-foreground">— Anonymous, S+ Tier Typer</p>
          <div className="flex items-center justify-center gap-1 text-primary">
            {[...Array(5)].map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center mt-20 p-12 bg-primary/10 rounded-3xl border border-primary">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Start?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join students and graduates from universities worldwide. Help your university climb the leaderboard and prove which school has the best typers.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6">
              Start Typing Free
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Open to all university students and graduates • Free forever • No sign-up required
          </p>
        </div>
      </div>
    </main>
  );
};

export default About;
