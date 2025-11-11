import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const topThree = [
  {
    rank: 2,
    name: "Sarah Chen",
    tier: "S+",
    score: 138,
    tags: ["CS 246", "Co-op"],
    color: "from-gray-300 to-gray-400"
  },
  {
    rank: 1,
    name: "Alex Kumar",
    tier: "S+",
    score: 142,
    tags: ["ECE", "Dean's List"],
    color: "from-yellow-200 to-yellow-400"
  },
  {
    rank: 3,
    name: "Emily Wu",
    tier: "A+",
    score: 135,
    tags: ["MATH 137", "Co-op"],
    color: "from-orange-300 to-orange-500"
  }
];

const restOfLeaders = [
  { rank: 4, name: "Michael Zhang", tier: "A+", score: 132, tags: ["SE", "Hackathon"] },
  { rank: 5, name: "Jessica Park", tier: "A", score: 128, tags: ["CS 136", "TA"] },
  { rank: 6, name: "David Lee", tier: "A", score: 125, tags: ["AFM", "Co-op"] },
  { rank: 7, name: "Sophia Tran", tier: "B+", score: 120, tags: ["SYDE", "Research"] },
  { rank: 8, name: "James Wilson", tier: "B+", score: 118, tags: ["MATH 135"] },
];

const getTierColor = (tier: string) => {
  if (tier.startsWith("S")) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
  if (tier.startsWith("A")) return "bg-blue-500/20 text-blue-500 border-blue-500/30";
  return "bg-green-500/20 text-green-500 border-green-500/30";
};

const Leaderboard = () => {
  const [search, setSearch] = useState("");

  return (
    <section id="leaderboard" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">Top Typists</h2>
          <p className="text-foreground-muted">Rankings based on typing scores</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search typists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-background-card border-border-subtle rounded-xl"
            />
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* #2 */}
          <div className="md:order-1 order-2">
            <div className="bg-gradient-to-br from-gray-400/10 to-gray-500/10 p-6 rounded-xl border border-gray-500/30 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
                  <Medal className="w-8 h-8 text-gray-900" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-gray-300">#{topThree[0].rank}</div>
                <h3 className="font-bold text-lg">{topThree[0].name}</h3>
                <Badge className={getTierColor(topThree[0].tier)}>{topThree[0].tier}</Badge>
                <div className="text-3xl font-bold text-gold">{topThree[0].score} WPM</div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {topThree[0].tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-background-card rounded-full border border-border-subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* #1 */}
          <div className="md:order-2 order-1">
            <div className="bg-gradient-to-br from-yellow-200/10 to-yellow-400/10 p-8 rounded-xl border-2 border-gold shadow-gold-glow hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-gold-glow-lg">
                  <Trophy className="w-10 h-10 text-gold-foreground" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-3xl font-bold text-gold">#{topThree[1].rank}</div>
                <h3 className="font-bold text-xl">{topThree[1].name}</h3>
                <Badge className={getTierColor(topThree[1].tier)}>{topThree[1].tier}</Badge>
                <div className="text-4xl font-bold text-gold">{topThree[1].score} WPM</div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {topThree[1].tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-background-card rounded-full border border-border-subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* #3 */}
          <div className="md:order-3 order-3">
            <div className="bg-gradient-to-br from-orange-300/10 to-orange-500/10 p-6 rounded-xl border border-orange-500/30 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-orange-900" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-orange-400">#{topThree[2].rank}</div>
                <h3 className="font-bold text-lg">{topThree[2].name}</h3>
                <Badge className={getTierColor(topThree[2].tier)}>{topThree[2].tier}</Badge>
                <div className="text-3xl font-bold text-gold">{topThree[2].score} WPM</div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {topThree[2].tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-background-card rounded-full border border-border-subtle">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="max-w-4xl mx-auto space-y-3">
          {restOfLeaders.map((leader) => (
            <div
              key={leader.rank}
              className="bg-background-card p-6 rounded-xl border border-border-subtle hover:bg-background-hover hover:border-gold/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-card-elevated flex items-center justify-center font-bold text-foreground-muted">
                    #{leader.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{leader.name}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {leader.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-background rounded-full border border-border-subtle">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getTierColor(leader.tier)}>{leader.tier}</Badge>
                  <div className="text-2xl font-bold text-gold min-w-[120px] text-right">
                    {leader.score} WPM
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
