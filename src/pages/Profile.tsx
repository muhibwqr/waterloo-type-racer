import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Clock, Target, TrendingUp, Loader2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { computeTierFromWpm, formatDuration } from "@/lib/stats";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FACULTY_OPTIONS } from "@/constants/faculties";
import { toast } from "sonner";

type ProfileRow = {
  id: string;
  username: string;
  tier: string | null;
  program: string | null;
  faculty: string | null;
  best_wpm?: number | null;
  best_accuracy?: number | null;
  average_wpm?: number | null;
  total_tests?: number | null;
  time_spent_seconds?: number | null;
  created_at: string | null;
};

type TypingTestRow = {
  id: string;
  created_at: string | null;
  wpm: number;
  accuracy: number;
  test_duration: number | null;
  test_mode: string;
};

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [tests, setTests] = useState<TypingTestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editFaculty, setEditFaculty] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const [{ data: profileData, error: profileError }, { data: testsData, error: testsError }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("typing_tests")
        .select("id, created_at, wpm, accuracy, test_duration, test_mode")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (profileError) {
      console.error("Failed to load profile", profileError);
      setError("We couldn't load your profile details right now.");
    } else {
      setProfile(profileData as ProfileRow | null);
    }

    if (testsError) {
      console.error("Failed to load tests", testsError);
      setError("We couldn't load your recent tests right now.");
      setTests([]);
    } else {
      setTests((testsData ?? []) as TypingTestRow[]);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    void fetchProfileData();

    const channel = supabase
      .channel(`typing-tests-profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_tests", filter: `user_id=eq.${user.id}` },
        () => {
          void fetchProfileData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfileData, user?.id]);

  const computedStats = useMemo(() => {
    if (tests.length === 0) {
      return {
        bestWpm: profile?.best_wpm ?? 0,
        bestAccuracy: profile?.best_accuracy ?? null,
        averageWpm: profile?.average_wpm ?? null,
        totalTests: profile?.total_tests ?? 0,
        timeSpentSeconds: profile?.time_spent_seconds ?? 0,
      };
    }

    const bestWpm = tests.reduce((max, test) => Math.max(max, test.wpm), 0);
    const bestAccuracy = tests.reduce((max, test) => Math.max(max, test.accuracy), 0);
    const totalTests = tests.length;
    const averageWpm = Math.round(tests.reduce((sum, test) => sum + test.wpm, 0) / totalTests);
    const timeSpentSeconds = tests.reduce((sum, test) => sum + Math.max(test.test_duration ?? 0, 0), 0);

    return {
      bestWpm,
      bestAccuracy,
      averageWpm,
      totalTests,
      timeSpentSeconds,
    };
  }, [profile, tests]);

  const tierLabel = useMemo(() => {
    if (profile?.tier) return profile.tier;
    const best = computedStats.bestWpm ?? 0;
    return computeTierFromWpm(best);
  }, [computedStats.bestWpm, profile?.tier]);

  const recentTests = tests.slice(0, 5);

  const openEditDialog = () => {
    setEditUsername(profile?.username ?? user.email?.split("@")[0] ?? "");
    setEditFaculty(profile?.faculty ?? "");
    setIsEditOpen(true);
  };

  const usernameValid =
    editUsername.length >= 3 && editUsername.length <= 20 && /^[a-zA-Z0-9_]+$/.test(editUsername);
  const facultyValid = editFaculty.length > 0;

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!usernameValid) {
      toast.error("Username must be 3-20 characters (letters, numbers, underscore only)");
      return;
    }
    if (!facultyValid) {
      toast.error("Select your faculty");
      return;
    }

    const updates: Record<string, string> = {};
    if (editUsername !== profile?.username) {
      updates.username = editUsername;
    }
    if (editFaculty !== (profile?.faculty ?? "")) {
      updates.faculty = editFaculty;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      setIsEditOpen(false);
      return;
    }

    setSavingProfile(true);
    const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id);

    const { error: userMetadataError } = await supabase.auth.updateUser({
      data: { username: editUsername, faculty: editFaculty },
    });

    if (updateError || userMetadataError) {
      console.error("Failed to update profile", updateError ?? userMetadataError);
      toast.error("Couldn't save profile changes. Try again.");
    } else {
      toast.success("Profile updated!");
      await fetchProfileData();
      setIsEditOpen(false);
    }
    setSavingProfile(false);
  };

  const stats = [
    {
      icon: Trophy,
      label: "Best WPM",
      value: computedStats.bestWpm ? computedStats.bestWpm.toString() : "—",
      sublabel: computedStats.bestAccuracy ? `${computedStats.bestAccuracy.toFixed(1)}% accuracy` : "No tests yet",
    },
    {
      icon: TrendingUp,
      label: "Average WPM",
      value: computedStats.averageWpm ? computedStats.averageWpm.toString() : "—",
      sublabel:
        computedStats.averageWpm && profile?.average_wpm
          ? `Personal avg: ${profile.average_wpm.toFixed(1)}`
          : "Start racing to see stats",
    },
    {
      icon: Target,
      label: "Tests Completed",
      value: computedStats.totalTests.toString(),
      sublabel: "Total tests recorded",
    },
    {
      icon: Clock,
      label: "Time Spent",
      value: formatDuration(computedStats.timeSpentSeconds),
      sublabel: "Across recorded sessions",
    },
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
          <h1 className="text-4xl font-bold text-foreground mb-2">{profile?.username ?? user.email?.split("@")[0]}</h1>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-lg px-4 py-1">
            {tierLabel} TIER
          </Badge>
          <p className="text-muted-foreground mt-4">
            Faculty: {profile?.faculty ?? "Add your faculty"}
          </p>
          <p className="text-sm text-muted-foreground">
            Member since{" "}
            {profile?.created_at
              ? format(new Date(profile.created_at), "MMMM dd, yyyy")
              : user.created_at
              ? format(new Date(user.created_at), "MMMM dd, yyyy")
              : "—"}
          </p>
          <Button variant="outline" className="mt-6" onClick={openEditDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit profile
          </Button>
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

        {/* Recent Tests */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-10">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading your recent tests…
              </div>
            ) : recentTests.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No recorded tests yet. Complete a typing test to see your stats here.
              </div>
            ) : (
              <div className="space-y-3">
                {recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {test.created_at ? format(new Date(test.created_at), "MMM dd, yyyy") : "—"}
                      </div>
                      <div className="text-sm bg-background px-3 py-1 rounded-full border border-border capitalize">
                        {test.test_mode.replace("_", " ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-primary">{test.wpm} WPM</div>
                        <div className="text-sm text-muted-foreground">{test.accuracy.toFixed(1)}% acc</div>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {test.wpm === computedStats.bestWpm ? "Personal Best" : "Recorded"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && (
              <p className="text-destructive text-sm text-center mt-6">
                {error} Try again in a moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name and faculty.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-foreground">
                Display Name
              </Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(event) => setEditUsername(event.target.value)}
                className={`h-11 ${
                  usernameValid ? "border-primary" : "border-border"
                } focus:border-primary`}
              />
              {!usernameValid && (
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers or underscore.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-faculty" className="text-foreground">
                Faculty
              </Label>
              <Select value={editFaculty} onValueChange={setEditFaculty}>
                <SelectTrigger id="edit-faculty" className="h-11">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {FACULTY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile || !usernameValid || !facultyValid}>
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Profile;
