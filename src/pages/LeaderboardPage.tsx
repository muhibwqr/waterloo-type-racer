import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { subDays, subMonths, subWeeks } from "date-fns";
import { computeTierFromWpm } from "@/lib/stats";

type DisplayRow = {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number | null;
  program: string | null;
  tier: string | null;
  isPlaceholder?: boolean;
  createdAt: string | null;
};

const totalSlots = 23;
const placeholderName = "Waiting for a Waterloo Warrior";
const placeholderProgram = "Claim this spot";

const LeaderboardPage = () => {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from("typing_tests")
      .select("user_id, wpm, accuracy, created_at")
      .order("wpm", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Failed to fetch leaderboard entries", error);
      setFetchError("We couldn't load the leaderboard right now.");
      setRows([]);
      setLoading(false);
      return;
    }

    const uniqueByUser = new Map<string, { wpm: number; accuracy: number; created_at: string | null }>();
    const anonymousEntries: DisplayRow[] = [];

    data?.forEach((entry) => {
      if (!entry.user_id) {
        anonymousEntries.push({
          rank: 0,
          name: "Anonymous Warrior",
          wpm: entry.wpm,
          accuracy: entry.accuracy,
          program: null,
          tier: null,
          createdAt: entry.created_at,
        });
        return;
      }

      if (!uniqueByUser.has(entry.user_id)) {
        uniqueByUser.set(entry.user_id, {
          wpm: entry.wpm,
          accuracy: entry.accuracy,
          created_at: entry.created_at,
        });
      }
    });

    const userIds = Array.from(uniqueByUser.keys());
    let profileLookup: Record<string, { username: string | null; tier: string | null; program: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, tier, program, faculty")
        .in("id", userIds);

      if (profileError) {
        console.error("Failed to fetch profile information", profileError);
      } else {
        profileLookup = (profileData ?? []).reduce<
          Record<string, { username: string | null; tier: string | null; program: string | null }>
        >((acc, profile) => {
          acc[profile.id] = {
            username: profile.username,
            tier: profile.tier,
            program: profile.program ?? profile.faculty ?? null,
          };
          return acc;
        }, {});
      }
    }

    const formatted: DisplayRow[] = Array.from(uniqueByUser.entries()).map(([userId, result]) => {
      const profile = profileLookup[userId];
      return {
        rank: 0,
        name: profile?.username ?? `Warrior ${userId.slice(0, 6)}`,
        wpm: result.wpm,
        accuracy: result.accuracy ?? null,
        program: profile?.program ?? null,
        tier: profile?.tier ?? null,
        createdAt: result.created_at ?? null,
      };
    });

    const combined = [...formatted, ...anonymousEntries].sort((a, b) => b.wpm - a.wpm).slice(0, totalSlots);

    setRows(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      if (!active) return;
      await loadLeaderboard();
    };

    void initialize();

    const channel = supabase
      .channel("typing-tests-leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_tests" },
        () => {
          void loadLeaderboard();
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [loadLeaderboard]);

  const getTierForWpm = (wpm: number) => {
    if (wpm >= 140) return "S+";
    if (wpm >= 125) return "S";
    if (wpm >= 115) return "A+";
    if (wpm >= 105) return "A";
    if (wpm >= 95) return "B";
    if (wpm >= 85) return "C";
    return "D";
  };

  const filteredRows = useMemo(() => {
    const now = new Date();

    const withinRange = (createdAt: string | null) => {
      if (!createdAt) return true;
      const createdDate = new Date(createdAt);
      if (Number.isNaN(createdDate.getTime())) return true;

      switch (timeFilter) {
        case "today":
          return createdDate >= subDays(now, 1);
        case "week":
          return createdDate >= subWeeks(now, 1);
        case "month":
          return createdDate >= subMonths(now, 1);
        default:
          return true;
      }
    };

    const timeFiltered = rows.filter((row) => withinRange(row.createdAt));

    const enriched: DisplayRow[] = timeFiltered.map((row) => ({
      ...row,
      tier: row.tier ?? computeTierFromWpm(row.wpm),
    }));

    const query = search.trim().toLowerCase();
    const searched = query.length
      ? enriched.filter((entry) => entry.name.toLowerCase().includes(query))
      : enriched;

    if (searched.length >= totalSlots) {
      return searched.slice(0, totalSlots);
    }

    const placeholdersNeeded = totalSlots - searched.length;
    const placeholderEntries = Array.from({ length: placeholdersNeeded }, (_, idx) => ({
      rank: searched.length + idx + 1,
      name: placeholderName,
      wpm: 0,
      accuracy: null,
      program: placeholderProgram,
      tier: null,
      isPlaceholder: true,
      createdAt: null,
    }));

    const ranked = [...searched, ...placeholderEntries].map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return ranked;
  }, [rows, search, timeFilter]);

  const topThree = filteredRows.slice(0, 3);
  const restOfLeaders = filteredRows.slice(3);

  const getTierColor = (tier: string) => {
    if (tier === "S+") return "bg-primary/20 text-primary border-primary/30";
    if (tier.startsWith("S")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (tier.startsWith("A")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (tier.startsWith("B")) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (tier.startsWith("C")) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Top typers at University of Waterloo</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {['all', 'month', 'week', 'today'].map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className={`${
                timeFilter === filter
                  ? 'text-primary border-b-2 border-primary rounded-none'
                  : 'text-muted-foreground'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : filter === 'week' ? 'This Week' : 'Today'}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-card border-border rounded-xl"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground mb-12">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading leaderboard…</span>
          </div>
        )}

        {fetchError && !loading && (
          <div className="max-w-2xl mx-auto mb-12 px-6 py-4 bg-destructive/10 border border-destructive/30 rounded-xl text-center text-destructive">
            {fetchError}
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {topThree.map((user, idx) => {
            const isPlaceholder = user.isPlaceholder;
            const isFirst = user.rank === 1;
            const Icon = isFirst ? Trophy : user.rank === 2 ? Medal : Award;
            const bgGradient = isFirst
              ? "from-yellow-500/10 to-yellow-600/10 border-primary"
              : user.rank === 2
              ? "from-gray-400/10 to-gray-500/10 border-gray-500/30"
              : "from-orange-400/10 to-orange-500/10 border-orange-500/30";

            return (
              <div
                key={user.rank}
                className={`${idx === 1 ? 'md:order-2' : idx === 0 ? 'md:order-1' : 'md:order-3'} order-${idx + 1}`}
              >
                <div
                  className={`bg-gradient-to-br ${bgGradient} border-2 p-8 rounded-2xl hover:scale-105 transition-transform duration-300 ${
                    isFirst ? 'md:scale-110 shadow-gold-glow' : ''
                  }`}
                >
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-20 h-20 rounded-full ${
                        isFirst ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-secondary'
                      } flex items-center justify-center shadow-lg`}
                    >
                      <Icon className={`w-10 h-10 ${isFirst ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <div className={`text-3xl font-bold ${isFirst ? 'text-primary' : 'text-muted-foreground'}`}>
                      #{user.rank}
                    </div>
                    <h3 className="font-bold text-xl text-foreground">{user.name}</h3>
                    <Badge className={isPlaceholder ? "bg-muted text-muted-foreground border-border" : getTierColor(user.tier ?? "D")}>
                      {isPlaceholder ? "Awaiting Warrior" : `${user.tier ?? "D"} Tier`}
                    </Badge>
                    <div className="text-4xl font-bold text-primary">
                      {isPlaceholder ? "—" : `${user.wpm} WPM`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isPlaceholder || user.accuracy === null ? "Accuracy TBD" : `${user.accuracy.toFixed(1)}% accuracy`}
                    </p>
                    <span className="inline-block text-xs px-3 py-1 bg-card rounded-full border border-border">
                      {user.program ?? placeholderProgram}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of Leaderboard */}
        <div className="max-w-4xl mx-auto space-y-3">
          {restOfLeaders.map((user) => (
            <div
              key={user.rank}
              className="bg-card p-6 rounded-xl border border-border hover:bg-secondary/50 hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                    #{user.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-foreground mb-1">{user.name}</h4>
                    <span className="text-xs px-3 py-1 bg-background rounded-full border border-border">
                      {user.program ?? placeholderProgram}
                    </span>
                  </div>
                </div>
                {user.isPlaceholder ? (
                  <div className="text-right text-muted-foreground text-sm">
                    Waiting on your record-breaking run
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <Badge className={getTierColor(user.tier ?? "D")}>{user.tier ?? "D"}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{user.wpm} WPM</div>
                      <p className="text-sm text-muted-foreground">
                        {user.accuracy === null ? "Accuracy TBD" : `${user.accuracy.toFixed(1)}% acc`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LeaderboardPage;
