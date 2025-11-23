import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, LogOut } from "lucide-react";

interface FlaggedTest {
  id: string;
  user_id: string;
  username: string | null;
  wpm: number;
  accuracy: number;
  created_at: string | null;
  flagged: boolean;
  reason: string;
}

export default function AdminApprovalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState<FlaggedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    // Check admin status
    if (!user) {
      navigate("/admin-approval-auth");
      return;
    }

    const userRole = user.app_metadata?.role;
    if (userRole !== "admin") {
      navigate("/admin-approval-auth");
      return;
    }

    loadFlaggedTests();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("flagged-tests-updates")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "typing_tests", 
          filter: "flagged=eq.true" 
        },
        () => {
          void loadFlaggedTests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const loadFlaggedTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("typing_tests")
        .select("*")
        .eq("flagged", true)
        .is("approved", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map to FlaggedTest with reason
      const flaggedTests: FlaggedTest[] = (data || []).map((test) => {
        let reason = "";
        if (test.wpm > 130) {
          reason = `Suspiciously high WPM: ${test.wpm}`;
        } else if (test.accuracy > 98 && test.wpm > 110) {
          reason = `Perfect accuracy (${test.accuracy}%) + high WPM (${test.wpm})`;
        } else {
          reason = "Flagged for review";
        }
        
        return {
          id: test.id,
          user_id: test.user_id,
          username: test.username,
          wpm: test.wpm,
          accuracy: test.accuracy,
          created_at: test.created_at,
          flagged: test.flagged,
          reason,
        };
      });

      setTests(flaggedTests);
    } catch (error) {
      toast.error("Failed to load flagged tests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (testId: string) => {
    setApproving(testId);
    try {
      const { error } = await supabase
        .from("typing_tests")
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", testId);

      if (error) throw error;

      toast.success("Test approved!");
      setTests(tests.filter(t => t.id !== testId));
    } catch (error) {
      toast.error("Failed to approve test");
      console.error(error);
    } finally {
      setApproving(null);
    }
  };

  const handleDeny = async (testId: string) => {
    setApproving(testId);
    try {
      const { error } = await supabase
        .from("typing_tests")
        .delete()
        .eq("id", testId);

      if (error) throw error;

      toast.success("Test denied and removed!");
      setTests(tests.filter(t => t.id !== testId));
    } catch (error) {
      toast.error("Failed to deny test");
      console.error(error);
    } finally {
      setApproving(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-approval-auth");
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Approval Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Flagged Tests {loading ? "" : `(${tests.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading flagged tests...</span>
              </div>
            ) : tests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No flagged tests to review
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-left py-3 px-4 font-semibold">WPM</th>
                      <th className="text-left py-3 px-4 font-semibold">Accuracy</th>
                      <th className="text-left py-3 px-4 font-semibold">Reason Flagged</th>
                      <th className="text-left py-3 px-4 font-semibold">Submitted</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test) => (
                      <tr key={test.id} className="border-b hover:bg-secondary/50">
                        <td className="py-3 px-4">{test.username || "Anonymous"}</td>
                        <td className="py-3 px-4 font-bold">{test.wpm}</td>
                        <td className="py-3 px-4">{test.accuracy.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400">{test.reason}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {test.created_at ? new Date(test.created_at).toLocaleString() : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(test.id)}
                            disabled={approving === test.id}
                          >
                            {approving === test.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeny(test.id)}
                            disabled={approving === test.id}
                          >
                            {approving === test.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Deny
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

