import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Trophy, label: "Best WPM", value: "142", sublabel: "99.2% accuracy" },
    { icon: TrendingUp, label: "Average WPM", value: "128", sublabel: "↑ 5 from last week" },
    { icon: Target, label: "Tests Completed", value: "247", sublabel: "Total tests" },
    { icon: Clock, label: "Time Spent", value: "24h", sublabel: "Total typing time" },
  ];

  const recentTests = [
    { date: "2025-01-15", mode: "time 30s", wpm: 142, accuracy: 99.2, result: "New Best!" },
    { date: "2025-01-15", mode: "words 50", wpm: 138, accuracy: 98.5, result: "Great" },
    { date: "2025-01-14", mode: "time 60s", wpm: 135, accuracy: 97.8, result: "Good" },
  ];

  if (!user) {
    return (
      <main className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground text-lg">Please sign in to view profile</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <Avatar className="w-32 h-32 mx-auto mb-6">
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold text-foreground mb-2">{user.email?.split('@')[0]}</h1>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-1">
            S+ TIER
          </Badge>
          <p className="text-muted-foreground mt-4">#247 globally</p>
          <p className="text-sm text-muted-foreground">Member since January 2025</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Section */}
        <Card className="bg-card border-border mb-12">
          <CardHeader>
            <CardTitle className="text-foreground">Road to Next Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current: <span className="text-primary font-semibold">S+ (142 WPM)</span></span>
                <span className="text-muted-foreground">Next: <span className="text-foreground font-semibold">Master (150 WPM)</span></span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
              </div>
              <p className="text-sm text-muted-foreground">8 WPM to go!</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tests */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTests.map((test, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">{test.date}</div>
                    <div className="text-sm bg-background px-3 py-1 rounded-full border border-border">
                      {test.mode}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-bold text-primary">{test.wpm} WPM</div>
                      <div className="text-sm text-muted-foreground">{test.accuracy}% acc</div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {test.result}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
