import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CommandPalette from "@/components/CommandPalette";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Target, Clock, Zap, BarChart3, Trophy } from "lucide-react";
import { computeTierFromWpm } from "@/lib/stats";

type TestMode = "time" | "words" | "quote" | "zen" | "custom";

type Stats = {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  words: number;
  elapsedMs: number;
};

type TimeSeriesPoint = {
  time: number; // seconds elapsed
  wpm: number;
  accuracy: number;
};

const prompts = [
  "University where your GPA tries to survive longer than your motivation",
  "If you haven't pulled an all-nighter have you really been to college",
  "Internships because you wanted four months of existential dread now with pay",
  "Beware of midterms AND finals both bite harder than expected",
  "Every new semester starts with hope and ends with caffeine addiction",
  "At university the only ring we get is from coffee cups and maybe graduation",
  "Ask any student about weekends wait what's a weekend",
  "If you nap in the library beware your notes might grade themselves",
  "Campus roads for cars bikes procrastinators and confused first-years",
  "The library is where sleep schedules go to die",
  "If your friend goes missing check the study pods first floor",
  "Campus Wi-Fi fast enough for memes slow enough for Zoom",
  "You know you're in college when you schedule meetings in time zones",
  "The campus is so big sometimes your lecture and your motivation are miles apart",
  "A university degree is just caffeine stories and lots of LinkedIn connections",
  "Surviving orientation week the first true test of college",
  "University mascots are cute but the real mascot is the coffee machine",
  "Best campus pickup line wanna study together",
  "Eight months of classes and four months of realizing you actually like sleep",
  "Your student ID doubles as a scraper for winter windshield frost",
  "The student portal's real feature is reminding you of all your overdue assignments",
  "Student center is where life is waiting for food at lunch rush",
  "You haven't suffered until you've raced to class and lost",
  "Final exam security is tighter than the line for free pizza at club fair",
  "Engineering where rulers are used for measuring stress",
  "Midterm season ten students nine coffee cups one desperate prayer",
  "Science building aka Causing Panic Hour during finals",
  "Job interviews more plot twists than a Netflix drama",
  "The library was built by caffeinated students",
  "Professors say attendance isn't mandatory students say Netflix is",
  "University meetings this could've been an email",
  "Four-month semesters just long enough to forget what happiness feels like",
  "Student budget ramen hope and instant noodles",
  "Campus fitness is running to class because you missed the bus again",
  "The library a place of learning napping and existential crisis",
  "If you make it through finals you can survive anything",
  "Campus is green so are the students after eating all the free food",
  "All-nighters because the only thing faster than your deadlines is campus Wi-Fi after 2 am",
  "Internships taught me LinkedIn stalking is a survival skill",
  "Lost on campus follow the sound of groans and caffeine machines",
  "Even the campus squirrels look stressed during finals",
  "Student government elections more drama than a group project",
  "Hackathons caffeine code and sleep deprivation",
  "One hundred clubs but not a club for Surviving Calculus",
  "Campus weather goes from summer to winter in 24 hours",
  "The most popular major is complaining about your major",
  "Food trucks the real reason students survive midterms",
  "If you trip on campus don't worry everyone else is too busy to notice",
  "Course enrollment Hunger Games for nerds",
  "Unofficial motto sleep is for the weak",
  "First-year dorms friendships are forged and instant noodles reign",
  "Library come for the books stay for the breakdowns",
  "If you think campus is endless wait until you see your student debt",
  "Tradition get lost at least twice in every building",
  "Student center microwaves proof the university cares about student health sort of",
  "Campus fitness climbing stairs when the elevator's broken again",
  "All campus legends start with one time at a party",
  "Campus map tip disregard locations follow Wi-Fi signals",
  "Study tip sell your soul for better grades",
  "Student discounts not on tuition but maybe on coffee",
  "Student hack save money by borrowing textbooks or memories from upper-years",
  "Finals when even the campus looks for escape routes",
  "Student parties calculated fun guaranteed puns",
  "Dining hall chicken or beef can I get a third option not here",
  "The real campus hierarchy professors then students",
  "Campus events free pizza free pens and free emotional breakdowns",
  "If you walk the full campus that counts as cardio right",
  "University where your part-time job might pay less than your rent",
  "Group projects where two people do the work one schedules meetings and one disappears",
  "Campus weather is the only thing less predictable than your GPA",
  "Most students study at the library after dark the rest are just haunting the halls",
  "Club fair tip sign up for free stuff commit to none",
  "If you haven't had coffee spilled on you are you even a student",
  "Orientation where you meet your next four months of stress",
  "All-nighters tradition necessity regret",
  "Research projects bigger mysteries than final exams",
  "Midterms the time when everyone becomes an expert in creative grading",
  "If Google went down so would civilization",
  "Student lounge furniture older than most first-year students",
  "The gym where the strongest muscle is your will to survive finals",
  "Every group chat ten percent memes ninety percent panicked questions",
  "Who needs sleep when you have club meetings job apps and three group projects",
  "University motto inspiring minds crushing souls",
  "Study hacks find the Wi-Fi sweet spot avoid crowded areas",
  "Best time to see campus when everyone is asleep good luck",
  "Student deals buy two textbooks get your dreams crushed free",
  "Unofficial rival is the coffee shop line",
  "Career fair for jobs you'll apply to interviews you'll panic about",
  "Student center the best spot for group brainstorming and nap-taking",
  "The real exam is crossing campus during rush hour",
  "If you make a typo racing blame campus Wi-Fi",
  "Biggest secret alert status for caffeinated students",
  "If you survived a semester what's anything else to you",
  "Finals stress measured in cups of coffee and midterm memes",
  "Success formula study work survive",
  "First-years lost on campus fourth-years lost in existential dread",
  "Leaderboard for proving you really are faster than everyone",
  "Secret to graduation hide until convocation",
  "The truth about food trucks is out there",
  "University isn't just a school it's a vibe mostly exhaustion some caffeine",
];

const initialStats: Stats = {
  wpm: 0,
  accuracy: 100,
  correctChars: 0,
  totalChars: 0,
  words: 0,
  elapsedMs: 0,
};

const TypingTest = () => {
  const { user } = useAuth();
  const [testMode, setTestMode] = useState<TestMode>("time");
  const [duration, setDuration] = useState(30);
  const [typedText, setTypedText] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [finalStats, setFinalStats] = useState<Stats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(() => Math.floor(Math.random() * prompts.length));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [finishReason, setFinishReason] = useState<"time" | "manual" | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const timeSeriesIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalMistakesRef = useRef(0);
  const previousTypedLengthRef = useRef(0);
  const [finalTotalMistakes, setFinalTotalMistakes] = useState(0);

  const currentPrompt = prompts[currentPromptIndex];

  const timeOptions = useMemo(() => [15, 30, 60], []);

  const computeStats = useCallback((text: string, promptText: string, startedAt: number | null, mistakes: number = 0): Stats => {
    const totalChars = text.length;
    let correctChars = 0;
    let incorrectChars = 0;

    for (let index = 0; index < text.length; index += 1) {
      if (text[index] === promptText[index]) {
        correctChars += 1;
      } else {
        incorrectChars += 1;
      }
    }

    const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    const now = Date.now();
    const elapsedMs = startedAt ? Math.max(now - startedAt, 0) : 0;
    const elapsedMinutes = elapsedMs > 0 ? elapsedMs / 60000 : 0;
    const wpm = elapsedMinutes > 0 && words > 0 ? Math.round(words / elapsedMinutes) : 0;
    
    // Calculate accuracy based on correct characters vs total characters typed (including mistakes)
    // Total characters typed = correct + incorrect + mistakes (corrected errors)
    const totalCharsTyped = correctChars + incorrectChars + mistakes;
    // Accuracy = correct characters / total characters typed
    const accuracy = totalCharsTyped > 0 
      ? (correctChars / totalCharsTyped) * 100 
      : 100;

    return {
      wpm,
      accuracy: Number(accuracy.toFixed(1)),
      correctChars,
      totalChars,
      words,
      elapsedMs,
    };
  }, []);

  const finishTest = useCallback(
    (reason: "time" | "manual", finalText?: string) => {
      if (testFinished) {
        return;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (!startTime) {
        return;
      }

      const finalTypedText = finalText ?? typedText;
      const mistakes = totalMistakesRef.current;
      const stats = computeStats(finalTypedText, currentPrompt, startTime, mistakes);
      setFinalStats(stats);
      setFinalTotalMistakes(mistakes);
      // Lock the typed text to the exact prompt when completed
      if (finalTypedText === currentPrompt) {
        setTypedText(currentPrompt);
      }
      setTestStarted(false);
      setTestFinished(true);
      setFinishReason(reason);
      setTimeLeft(0);
      
      // Announce tier
      const tier = computeTierFromWpm(stats.wpm);
      toast.success(
        `${tier} Tier - ${stats.wpm} WPM @ ${stats.accuracy.toFixed(1)}% accuracy`,
        { 
          duration: 5000,
          icon: <Trophy className="w-5 h-5 text-primary" />,
        }
      );
      
      // Clear time series interval
      if (timeSeriesIntervalRef.current) {
        clearInterval(timeSeriesIntervalRef.current);
        timeSeriesIntervalRef.current = null;
      }
    },
    [computeStats, currentPrompt, startTime, testFinished, typedText],
  );

  const typedPromptExactly = typedText === currentPrompt;

  const canUploadScore = finalStats && testFinished && (finishReason === "time" || typedPromptExactly);

  const getRandomPromptIndex = useCallback(
    (excludeIndex: number) => {
      if (prompts.length <= 1) {
        return 0;
      }

      let nextIndex = Math.floor(Math.random() * prompts.length);
      if (nextIndex === excludeIndex) {
        nextIndex = (nextIndex + 1) % prompts.length;
      }
      return nextIndex;
    },
    [],
  );

  const handleRestart = useCallback(
    (options?: { nextDuration?: number; nextPrompt?: boolean }) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setTestStarted(false);
      setTestFinished(false);
      setTypedText("");
      setStartTime(null);
      setFinalStats(null);
      setTimeLeft(options?.nextDuration ?? duration);
      setFinishReason(null);
      setTimeSeriesData([]);
      totalMistakesRef.current = 0;
      previousTypedLengthRef.current = 0;
      setFinalTotalMistakes(0);

      if (options?.nextPrompt) {
        setCurrentPromptIndex((previous) => getRandomPromptIndex(previous));
      }
    },
    [duration, getRandomPromptIndex],
  );

  useEffect(() => {
    if (!testStarted || !startTime) {
      return;
    }

    // Track time series data every second
    timeSeriesIntervalRef.current = setInterval(() => {
      if (startTime && typedText.length > 0) {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const currentStats = computeStats(typedText, currentPrompt, startTime, totalMistakesRef.current);
        setTimeSeriesData((prev) => {
          // Avoid duplicate entries for the same second
          const roundedTime = Math.round(elapsedSeconds);
          if (prev.length > 0 && prev[prev.length - 1].time === roundedTime) {
            return prev;
          }
          return [
            ...prev,
            {
              time: roundedTime,
              wpm: currentStats.wpm,
              accuracy: currentStats.accuracy,
            },
          ];
        });
      }
    }, 1000);

    timerRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          finishTest("time");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timeSeriesIntervalRef.current) {
        clearInterval(timeSeriesIntervalRef.current);
        timeSeriesIntervalRef.current = null;
      }
    };
  }, [duration, finishTest, startTime, testStarted, typedText, currentPrompt, computeStats]);

  useEffect(() => {
    if (!testStarted) {
      setTimeLeft(duration);
    }
  }, [duration, testStarted]);

  const liveStats = useMemo(() => {
    if (!testStarted || !startTime) {
      return finalStats ?? initialStats;
    }
    return computeStats(typedText, currentPrompt, startTime, totalMistakesRef.current);
  }, [computeStats, currentPrompt, finalStats, startTime, testStarted, typedText]);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (testFinished) {
      return;
    }

    let value = event.target.value;
    
    // Limit input to prompt length
    if (value.length > currentPrompt.length) {
      value = value.slice(0, currentPrompt.length);
    }

    let effectiveStart = startTime;
    if (!testStarted) {
      const now = Date.now();
      setTestStarted(true);
      setTestFinished(false);
      setStartTime(now);
      setFinalStats(null);
      setTimeSeriesData([]);
      totalMistakesRef.current = 0;
      previousTypedLengthRef.current = 0;
      effectiveStart = now;
    }
    
    // Track mistakes: every time a character is typed incorrectly, count it
    const previousLength = previousTypedLengthRef.current;
    const currentLength = value.length;
    
    // If typing forward (not backspacing)
    if (currentLength > previousLength) {
      const newCharIndex = currentLength - 1;
      const expectedChar = currentPrompt[newCharIndex];
      const typedChar = value[newCharIndex];
      
      // If the newly typed character is wrong, count it as a mistake
      if (typedChar !== expectedChar) {
        totalMistakesRef.current += 1;
      }
    }
    // If backspacing, we don't need to do anything - mistakes are already counted
    
    previousTypedLengthRef.current = currentLength;
    setTypedText(value);

    // If the prompt is completed accurately, finish immediately
    if (value === currentPrompt && effectiveStart) {
      const stats = computeStats(value, currentPrompt, effectiveStart, totalMistakesRef.current);
      finishTest("manual", value);
      if (user) {
        void handleSaveScore({ auto: true, statsOverride: stats });
      } else {
        toast.info("Sign in to upload your result.");
      }
    }
  };

  const handlePreventClipboard = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      toast.info("Copy, cut, and paste are disabled during the test.");
    },
    [],
  );

  const handleSaveScore = async (options?: { auto?: boolean; statsOverride?: Stats }) => {
    const statsForUpload = options?.statsOverride ?? finalStats;

    if (!testFinished || !statsForUpload) {
      toast.info("Finish a test before uploading your score.");
      return;
    }

    if (finishReason !== "time" && !typedPromptExactly && !options?.statsOverride) {
      toast.info("Type the entire prompt accurately before uploading early.");
      return;
    }

    if (!user) {
      toast.info("Create an account to upload your scores and compete on the leaderboard.");
      return;
    }

    setIsSaving(true);
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("username, id_verification_status")
      .eq("id", user.id)
      .maybeSingle();

    // Check verification status
    if (profileRow?.id_verification_status !== "approved") {
      if (profileRow?.id_verification_status === "pending") {
        toast.info("Your ID is under review. You'll be able to upload scores once approved (within 24 hours).");
      } else if (profileRow?.id_verification_status === "rejected") {
        toast.error("Your ID verification was rejected. Please contact support.");
      } else {
        toast.info("Please complete ID verification to upload scores and appear on the leaderboard.");
      }
      setIsSaving(false);
      return;
    }
    const incorrectChars = Math.max(statsForUpload.totalChars - statsForUpload.correctChars, 0);
    const extraChars = Math.max(statsForUpload.totalChars - currentPrompt.length, 0);
    const missedChars = Math.max(currentPrompt.length - statsForUpload.totalChars, 0);

    try {
      const { error } = await supabase.from("typing_tests").insert({
        user_id: user.id,
        test_mode: testMode,
        test_duration: duration,
        language: "english",
        wpm: statsForUpload.wpm,
        raw_wpm: statsForUpload.wpm,
        accuracy: statsForUpload.accuracy,
        word_count: statsForUpload.words,
        correct_chars: statsForUpload.correctChars,
        incorrect_chars: incorrectChars,
        extra_chars: extraChars,
        missed_chars: missedChars,
        consistency: null,
        username: profileRow?.username ?? user.user_metadata?.username ?? user.email?.split("@")[0],
      });

      if (error) {
        throw error;
      }

      toast.success("Score uploaded! Nice typing.");
    } catch (uploadError) {
      console.error("Failed to upload score", uploadError);
      toast.error("We couldn't upload your score. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPrompt = () => {
    return currentPrompt.split("").map((character, index) => {
      const typedCharacter = typedText[index];
      const isCurrent = index === typedText.length && testStarted && !testFinished;
      let characterClass = "text-muted-foreground";

      if (typedCharacter !== undefined) {
        characterClass = typedCharacter === character ? "text-primary" : "text-destructive";
      } else if (isCurrent) {
        characterClass = "text-foreground";
      }

      return (
        <span
          key={`${character}-${index}`}
          className={`${characterClass} ${isCurrent ? "border-b-2 border-primary" : ""}`}
        >
          {character}
        </span>
      );
    });
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="mb-8">
            <div className="text-center mb-2">
              <h1 className="text-4xl font-bold text-foreground">
                Join Goose Typers
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Type your heart out with university-themed prompts. Compete with students from all universities.
            </p>
          </div>

          {/* Mode selector hidden - time mode only */}

          {testMode === "time" && (
            <div className="flex items-center justify-center gap-3">
              {timeOptions.map((time) => (
                <Button
                  key={time}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDuration(time);
                    handleRestart({ nextDuration: time });
                  }}
                  className={`${
                    duration === time
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {time}s
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            🌐 english
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {testFinished && finalStats ? (
            /* Test Results - Statistics and Graph */
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/40 rounded-lg p-4 text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">WPM</p>
                    <p className="text-2xl font-bold text-foreground">{finalStats.wpm}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-4 text-center">
                    <Target className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                    <p className="text-2xl font-bold text-foreground">{finalStats.accuracy.toFixed(1)}%</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Words</p>
                    <p className="text-2xl font-bold text-foreground">{finalStats.words}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-4 text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="text-2xl font-bold text-foreground">{(finalStats.elapsedMs / 1000).toFixed(1)}s</p>
                  </div>
                </div>

                {/* Character Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Characters</p>
                    <p className="text-lg font-semibold text-foreground">{finalStats.totalChars}</p>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Correct</p>
                    <p className="text-lg font-semibold text-green-400">{finalStats.correctChars}</p>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Mistakes</p>
                    <p className="text-lg font-semibold text-red-400">{finalTotalMistakes}</p>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Characters/sec</p>
                    <p className="text-lg font-semibold text-foreground">
                      {finalStats.elapsedMs > 0
                        ? ((finalStats.totalChars / finalStats.elapsedMs) * 1000).toFixed(1)
                        : "0"}
                    </p>
                  </div>
                </div>

                {/* Performance Graph */}
                <div className="bg-secondary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-6 text-foreground">Performance Over Time</h3>
                  <div className="w-full" style={{ minHeight: '350px' }}>
                    {timeSeriesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart 
                          data={timeSeriesData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis
                            dataKey="time"
                            label={{ value: "Time (seconds)", position: "insideBottom", offset: -10, style: { fill: "hsl(var(--muted-foreground))" } }}
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickMargin={8}
                          />
                          <YAxis
                            label={{ value: "WPM / Accuracy", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))" } }}
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickMargin={8}
                            domain={[0, 'dataMax + 10']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "0.5rem",
                              padding: "8px 12px",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "4px" }}
                            itemStyle={{ color: "hsl(var(--foreground))" }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="line"
                          />
                          <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                            activeDot={{ r: 6 }}
                            name="WPM"
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="hsl(142 76% 36%)"
                            strokeWidth={2.5}
                            dot={{ fill: "hsl(142 76% 36%)", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                            activeDot={{ r: 6 }}
                            name="Accuracy %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        <p>No performance data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={handleSaveScore}
                    disabled={!user || !canUploadScore || isSaving}
                    variant="outline"
                    className="min-w-[140px]"
                  >
                    {user ? (isSaving ? "Uploading..." : "Upload Score") : "Sign up to Upload"}
                  </Button>
                  <Button
                    onClick={() => handleRestart({ nextPrompt: true })}
                    className="min-w-[140px]"
                  >
                    Take New Test
                  </Button>
                </div>
                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Anyone can type; sign in or create an account to upload scores.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Typing Test Area */
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-secondary/40 rounded-xl p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Time Left</p>
                  <p className="text-2xl font-semibold text-foreground">{timeLeft}s</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Words Per Minute</p>
                  <p className="text-2xl font-semibold text-foreground">{liveStats.wpm}</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Accuracy</p>
                  <p className="text-2xl font-semibold text-foreground">{liveStats.accuracy.toFixed(1)}%</p>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="font-mono text-xl sm:text-2xl leading-relaxed min-h-[120px] sm:min-h-[160px] whitespace-pre-wrap break-words">
                  {renderPrompt()}
                </div>
                {/* Hidden input overlay - invisible but captures all typing */}
                <input
                  type="text"
                  value={typedText}
                  onChange={handleTextChange}
                  onPaste={handlePreventClipboard}
                  onCopy={handlePreventClipboard}
                  onCut={handlePreventClipboard}
                  disabled={testFinished}
                  autoFocus={!testFinished}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text font-mono text-xl sm:text-2xl"
                  style={{ caretColor: 'transparent' }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleRestart()}>
                    Restart
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleRestart({ nextPrompt: true });
                    }}
                  >
                    New Prompt
                  </Button>
                  {testStarted && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!typedPromptExactly) {
                          toast.info("Type the full prompt accurately to finish early.");
                          return;
                        }
                        finishTest("manual");
                      }}
                    >
                      Finish Test
                    </Button>
            )}
          </div>
                <Button
                  onClick={handleSaveScore}
                  disabled={!user || !canUploadScore || isSaving}
                  className="min-w-[140px]"
                >
                  {user ? (isSaving ? "Uploading..." : "Upload Score") : "Sign up to Upload"}
                </Button>
          </div>
          {!user && (
                <p className="text-xs text-muted-foreground text-right mt-2">
                  Anyone can type; sign in or create an account to upload scores.
              </p>
              )}
            </div>
          )}
        </div>

        </div>
      </div>
      <CommandPalette open={showCommandPalette} onOpenChange={setShowCommandPalette} />
    </main>
  );
};

export default TypingTest;
