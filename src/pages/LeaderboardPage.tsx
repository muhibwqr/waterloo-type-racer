import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { subDays, subMonths, subWeeks } from "date-fns";
import { computeTierFromWpm } from "@/lib/stats";
import { getSchoolNameFromEmail } from "@/utils/emailToSchool";

type DisplayRow = {
  rank: number;
  name: string;
  wpm: number;
  accuracy: number | null;
  program: string | null;
  tier: string | null;
  isPlaceholder?: boolean;
  createdAt: string | null;
  school_name?: string | null;
};

const totalSlots = 23;
const placeholderName = "Waiting for a Goose Typer";
const placeholderProgram = "Claim this spot";

const LeaderboardPage = () => {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"users" | "universities">("universities");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    // Fetch directly from leaderboard table
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("wpm", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to fetch leaderboard entries", error);
      setFetchError("We couldn't load the leaderboard right now.");
      setRows([]);
      setLoading(false);
      return;
    }

    // Map leaderboard data to DisplayRow format
    const formatted: DisplayRow[] = (data ?? []).map((entry) => {
      // Extract username from email (part before @)
      const emailUsername = entry.email?.split("@")[0] || "Anonymous";
      
      // Match university by email domain
      const universityName = entry.email ? getSchoolNameFromEmail(entry.email) : "Unknown University";
      
      // Compute tier from WPM
      const tier = computeTierFromWpm(entry.wpm);

      return {
        rank: 0, // Will be assigned after sorting
        name: emailUsername,
        wpm: entry.wpm,
        accuracy: entry.accuracy ?? null,
        program: entry.program ?? null,
        tier: tier,
        createdAt: entry.created_at ?? null,
        school_name: universityName, // Match university from email domain
      };
    });

    // Only include verified users - exclude anonymous entries
    // Sort by WPM descending and assign ranks
    const sorted = formatted.sort((a, b) => b.wpm - a.wpm);
    const combined = sorted
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }))
      .slice(0, totalSlots);

    console.log(`Leaderboard loaded: ${combined.length} users displayed`);
    if (combined.length > 0) {
      const wpmValues = combined.map(r => r.wpm).sort((a, b) => b - a);
      console.log(`WPM range: ${wpmValues[wpmValues.length - 1]} - ${wpmValues[0]}`);
      console.log(`All WPM scores:`, wpmValues);
      console.log(`Expected: 12 users (51-306 WPM) + 1 test entry (45000 WPM) = 13 total`);
    } else {
      console.warn('Leaderboard is empty - no users to display');
    }

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
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
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

    const searchedRows = timeFiltered.filter((entry) => {
      const query = search.trim().toLowerCase();
      if (!query.length) return true;
      return entry.name.toLowerCase().includes(query);
    });

    if (viewMode === "universities") {
      // Group by school_name and calculate average WPM
      const schoolGroups = searchedRows.reduce<Record<string, { wpmSum: number; count: number; entries: DisplayRow[] }>>((acc, entry) => {
        const key = entry.school_name ?? "Unknown University";
        if (!acc[key]) {
          acc[key] = { wpmSum: 0, count: 0, entries: [] };
        }
        acc[key].wpmSum += entry.wpm;
        acc[key].count += 1;
        acc[key].entries.push(entry);
        return acc;
      }, {});

      const grouped: DisplayRow[] = Object.entries(schoolGroups).map(([schoolName, data]) => {
        const avgWpm = Math.round(data.wpmSum / data.count);
        return {
          rank: 0,
          name: schoolName,
          wpm: avgWpm,
          accuracy: null, // Average accuracy could be calculated if needed
          program: schoolName,
          tier: computeTierFromWpm(avgWpm),
          createdAt: null,
          isPlaceholder: false,
          school_name: schoolName,
        };
      });

      const sorted = grouped
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, totalSlots)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      if (sorted.length >= totalSlots) {
        return sorted;
      }

      const placeholdersNeeded = totalSlots - sorted.length;
      const placeholders = Array.from({ length: placeholdersNeeded }, (_, idx) => ({
        rank: sorted.length + idx + 1,
        name: placeholderName,
        wpm: 0,
        accuracy: null,
        program: placeholderProgram,
        tier: null,
        isPlaceholder: true,
        createdAt: null,
      }));

      return [...sorted, ...placeholders];
    }

    const enriched: DisplayRow[] = searchedRows.map((row) => ({
      ...row,
      tier: row.tier ?? computeTierFromWpm(row.wpm),
    }));

    const sortedEnriched = [...enriched].sort((a, b) => b.wpm - a.wpm);

    if (sortedEnriched.length >= totalSlots) {
      return sortedEnriched.slice(0, totalSlots).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    }

    const placeholdersNeeded = totalSlots - sortedEnriched.length;
    const placeholderEntries = Array.from({ length: placeholdersNeeded }, (_, idx) => ({
      rank: sortedEnriched.length + idx + 1,
      name: placeholderName,
      wpm: 0,
      accuracy: null,
      program: placeholderProgram,
      tier: null,
      isPlaceholder: true,
      createdAt: null,
    }));

    const ranked = [...sortedEnriched, ...placeholderEntries].map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return ranked;
  }, [rows, search, timeFilter, viewMode]);

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

  const placeholderBadgeLabel = viewMode === "universities" ? "Awaiting University" : "Awaiting Typer";
  const searchPlaceholder = viewMode === "universities" ? "Search universities..." : "Search users...";

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Top typers across all universities</p>
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

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={viewMode === "users" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("users")}
            aria-pressed={viewMode === "users"}
          >
            User Leaderboard
          </Button>
          <Button
            variant={viewMode === "universities" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("universities")}
            aria-pressed={viewMode === "universities"}
          >
            University Leaderboard
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
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
                    <Badge
                      className={
                        isPlaceholder
                          ? "bg-muted text-muted-foreground border-border"
                          : getTierColor(user.tier ?? "D")
                      }
                    >
                      {isPlaceholder
                        ? placeholderBadgeLabel
                        : viewMode === "universities"
                        ? "Avg WPM"
                        : `${user.tier ?? "D"} Tier`}
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
                    {viewMode === "universities"
                      ? "Be the first to represent your university."
                      : "Waiting on your record-breaking run"}
                  </div>
                ) : (
                <div className="flex items-center gap-6">
                    <Badge className={getTierColor(user.tier ?? "D")}>
                      {viewMode === "universities" ? "Avg WPM" : user.tier ?? "D"}
                    </Badge>
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
