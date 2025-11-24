import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { computeTierFromWpm } from "@/lib/stats";
import { getSchoolNameFromEmail } from "@/utils/emailToSchool";
import { getCredibilityTier, calculateCredibilityScore, getCredibilityTierName, type CredibilityTier } from "@/lib/credibility";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

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
  testCount?: number;
  credibilityTier?: string;
  bestWpm?: number;
  bestAccuracy?: number;
};

const totalSlots = 23;
const placeholderName = "Waiting for a Goose Typer";
const placeholderProgram = "Claim this spot";

const LeaderboardPage = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    // Fetch from typing_tests_seed table, grouped by university
    const { data, error } = await supabase
      .from("typing_tests_seed")
      .select("university, wpm, accuracy")
      .not("university", "is", null)
      .order("wpm", { ascending: false });

    if (error) {
      console.error("Failed to fetch leaderboard entries", error);
      setFetchError("We couldn't load the leaderboard right now.");
      setRows([]);
      setLoading(false);
      return;
    }

    // Group by university and calculate stats
    const universityMap = new Map<string, { 
      wpmValues: number[]; 
      accuracyValues: number[]; 
      count: number;
      bestWpm: number;
      bestAccuracy: number;
      allEntries: Array<{ wpm: number; accuracy: number }>;
    }>();
    
    const MIN_DECENT_ACCURACY = 85; // Minimum accuracy threshold for "best" entry
    
    (data ?? []).forEach((entry) => {
      if (!entry.university) {
        console.warn("Entry missing university:", entry);
        return;
      }
      
      const uni = entry.university.trim(); // Trim whitespace
      if (!universityMap.has(uni)) {
        universityMap.set(uni, { 
          wpmValues: [], 
          accuracyValues: [], 
          count: 0,
          bestWpm: 0,
          bestAccuracy: 0,
          allEntries: [],
        });
      }
      
      const stats = universityMap.get(uni)!;
      // Store individual values for proper averaging
      stats.wpmValues.push(entry.wpm);
      // Ensure accuracy is between 0 and 100 (cap invalid values)
      const accuracy = entry.accuracy ?? 0;
      const normalizedAccuracy = Math.min(100, Math.max(0, Number(accuracy))); // Cap at 0-100%
      stats.accuracyValues.push(normalizedAccuracy);
      
      // Store all entries for best score calculation
      stats.allEntries.push({ wpm: entry.wpm, accuracy: normalizedAccuracy });
      
      stats.count += 1;
    });
    
    // Calculate best entry for each university (high speed + decent accuracy)
    universityMap.forEach((stats, university) => {
      // Filter entries with at least decent accuracy
      const decentEntries = stats.allEntries.filter(entry => entry.accuracy >= MIN_DECENT_ACCURACY);
      
      if (decentEntries.length > 0) {
        // Find entry with highest WPM among decent accuracy entries
        const bestEntry = decentEntries.reduce((best, current) => {
          if (current.wpm > best.wpm || 
              (current.wpm === best.wpm && current.accuracy > best.accuracy)) {
            return current;
          }
          return best;
        });
        stats.bestWpm = bestEntry.wpm;
        stats.bestAccuracy = bestEntry.accuracy;
      } else {
        // Fallback: if no entries meet accuracy threshold, use highest WPM regardless
        const bestEntry = stats.allEntries.reduce((best, current) => {
          if (current.wpm > best.wpm || 
              (current.wpm === best.wpm && current.accuracy > best.accuracy)) {
            return current;
          }
          return best;
        });
        stats.bestWpm = bestEntry.wpm;
        stats.bestAccuracy = bestEntry.accuracy;
      }
    });

    console.log(`Grouped ${universityMap.size} universities from ${data?.length ?? 0} test entries`);

    // Convert to DisplayRow format - calculate proper averages with accuracy adjustment
    const formatted: DisplayRow[] = Array.from(universityMap.entries()).map(([university, stats]) => {
      // Calculate average WPM (sum all WPM values, divide by count)
      const avgWpm = stats.wpmValues.length > 0 
        ? Math.round(stats.wpmValues.reduce((sum, val) => sum + val, 0) / stats.wpmValues.length)
        : 0;
      
      // Calculate average accuracy (sum all accuracy values, divide by count)
      const avgAccuracy = stats.accuracyValues.length > 0
        ? Math.min(100, Math.max(0, stats.accuracyValues.reduce((sum, val) => sum + val, 0) / stats.accuracyValues.length))
        : null;
      
      // Calculate adjusted WPM (factoring in accuracy)
      const adjustedWpm = avgAccuracy !== null 
        ? Math.round(avgWpm * (avgAccuracy / 100))
        : avgWpm;
      
      // Apply credibility boost
      const credibilityTier = getCredibilityTier(stats.count);
      const credibilityScore = calculateCredibilityScore(adjustedWpm, stats.count);
      
      // Tier based on adjusted WPM
      const tier = computeTierFromWpm(avgWpm, avgAccuracy);

      console.log(`University: ${university}, Tests: ${stats.count}, Avg WPM: ${avgWpm}, Avg Accuracy: ${avgAccuracy?.toFixed(2)}%, Adjusted WPM: ${adjustedWpm}, Credibility: ${credibilityTier}, Final Score: ${credibilityScore}, Best: ${stats.bestWpm} WPM @ ${stats.bestAccuracy.toFixed(1)}%`);

      return {
        rank: 0, // Will be assigned after sorting
        name: university,
        wpm: credibilityScore, // Use credibility-adjusted score for ranking (average-based)
        accuracy: avgAccuracy,
        program: university,
        tier: tier,
        createdAt: null, // University aggregate doesn't have a single created_at
        school_name: university,
        testCount: stats.count,
        credibilityTier: credibilityTier,
        bestWpm: stats.bestWpm,
        bestAccuracy: stats.bestAccuracy,
      };
    });

    // Sort by credibility-adjusted score (which factors in accuracy and test count) descending and assign ranks
    const sorted = formatted.sort((a, b) => b.wpm - a.wpm);
    const combined = sorted
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }))
      .slice(0, totalSlots);

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
      .channel("typing-tests-seed-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_tests_seed" },
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
    const searchedRows = rows.filter((entry) => {
      const query = search.trim().toLowerCase();
      if (!query.length) return true;
      return entry.name.toLowerCase().includes(query);
    });

    if (searchedRows.length >= totalSlots) {
      return searchedRows.slice(0, totalSlots);
    }

    const placeholdersNeeded = totalSlots - searchedRows.length;
    const placeholders = Array.from({ length: placeholdersNeeded }, (_, idx) => ({
      rank: searchedRows.length + idx + 1,
      name: placeholderName,
      wpm: 0,
      accuracy: null,
      program: placeholderProgram,
      tier: null,
      isPlaceholder: true,
      createdAt: null,
      testCount: 0,
    }));

    return [...searchedRows, ...placeholders];
  }, [rows, search]);

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

  const getCredibilityBadgeStyle = (tier: CredibilityTier | undefined): string => {
    if (!tier) return "bg-muted text-muted-foreground border-border";
    switch (tier) {
      case "low":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "bronze":
        return "bg-amber-700/20 text-amber-600 border-amber-700/30";
      case "silver":
        return "bg-gray-400/20 text-gray-300 border-gray-400/30";
      case "gold":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "platinum":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  const getCredibilityTooltip = (tier: CredibilityTier | undefined, testCount: number | undefined): string => {
    if (!tier || !testCount) return "Credibility rating based on number of tests submitted";
    switch (tier) {
      case "low":
        return `Low Credibility (${testCount} ${testCount === 1 ? "test" : "tests"}): More tests needed for credibility boost`;
      case "bronze":
        return `Bronze Credibility (${testCount} tests): +2% ranking boost`;
      case "silver":
        return `Silver Credibility (${testCount} tests): +5% ranking boost`;
      case "gold":
        return `Gold Credibility (${testCount} tests): +10% ranking boost`;
      case "platinum":
        return `Platinum Credibility (${testCount} tests): +15% ranking boost`;
    }
  };

  const placeholderBadgeLabel = "Awaiting University";
  const searchPlaceholder = "Search universities...";

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">University Leaderboard</h1>
          <p className="text-muted-foreground text-lg">Top universities ranked by average WPM</p>
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
                    <div className="flex items-center gap-2 justify-center flex-wrap">
                      <Badge
                        className={
                          isPlaceholder
                            ? "bg-muted text-muted-foreground border-border"
                            : getTierColor(user.tier ?? "D")
                        }
                      >
                        {isPlaceholder ? placeholderBadgeLabel : `${user.tier ?? "D"} Tier`}
                      </Badge>
                      {!isPlaceholder && user.credibilityTier && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={getCredibilityBadgeStyle(user.credibilityTier)}>
                              {user.credibilityTier === "low" ? (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              ) : null}
                              {getCredibilityTierName(user.credibilityTier)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getCredibilityTooltip(user.credibilityTier, user.testCount)}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {isPlaceholder ? "—" : `${user.wpm} WPM`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isPlaceholder || user.accuracy === null ? "Accuracy TBD" : `Avg: ${user.accuracy.toFixed(1)}% accuracy`}
                    </p>
                    {!isPlaceholder && user.bestWpm && user.bestWpm > 0 && (
                      <p className="text-sm text-primary/80 font-semibold mt-1">
                        Best: {user.bestWpm} WPM @ {user.bestAccuracy?.toFixed(1) ?? "0"}% accuracy
                      </p>
                    )}
                    {!isPlaceholder && user.testCount && (
                      <span className="inline-block text-xs px-3 py-1 bg-card rounded-full border border-border mt-2">
                        {user.testCount} {user.testCount === 1 ? "test" : "tests"}
                      </span>
                    )}
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1 bg-background rounded-full border border-border">
                        {user.program ?? placeholderProgram}
                      </span>
                      {!user.isPlaceholder && user.credibilityTier && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={getCredibilityBadgeStyle(user.credibilityTier)}>
                              {user.credibilityTier === "low" ? (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              ) : null}
                              {getCredibilityTierName(user.credibilityTier)}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getCredibilityTooltip(user.credibilityTier, user.testCount)}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
                {user.isPlaceholder ? (
                  <div className="text-right text-muted-foreground text-sm">
                    Be the first to represent your university.
                  </div>
                ) : (
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Badge className={getTierColor(user.tier ?? "D")}>
                        {user.tier ?? "D"} Tier
                      </Badge>
                    </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{user.wpm} WPM</div>
                      <p className="text-sm text-muted-foreground">
                        {user.accuracy === null ? "Accuracy TBD" : `Avg: ${user.accuracy.toFixed(1)}% acc`}
                      </p>
                      {user.bestWpm && user.bestWpm > 0 && (
                        <p className="text-sm text-primary/80 font-semibold mt-1">
                          Best: {user.bestWpm} WPM @ {user.bestAccuracy?.toFixed(1) ?? "0"}%
                        </p>
                      )}
                      {user.testCount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.testCount} {user.testCount === 1 ? "test" : "tests"}
                        </p>
                      )}
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
