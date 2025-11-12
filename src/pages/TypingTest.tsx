import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, Hash, Quote, Zap, PenTool, Users, RefreshCw } from "lucide-react";

type TestMode = "time" | "words" | "quote" | "zen" | "custom";

type Stats = {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  words: number;
  elapsedMs: number;
};

const prompts = [
  "Waterloo where your GPA tries to survive longer than the geese on campus",
  "If you haven't dodged a goose have you really attended Waterloo",
  "Co-op because you wanted four months of existential dread now with pay",
  "Beware of geese AND midterms both bite",
  "Every new term starts with hope and ends with caffeine addiction",
  "At Waterloo the only ring we get is the Iron Ring and maybe geese rings",
  "Ask any Waterloo student about weekends wait what's a weekend",
  "If you nap at DP beware geese might grade your papers",
  "Ring Road for cars bikes procrastinators and confused first-years",
  "Davis Centre library is where sleep schedules go to die",
  "If your friend goes missing check the DC first-floor study pods",
  "Waterloo Wi-Fi fast enough for memes slow enough for Zoom",
  "You know you go to Waterloo when you schedule meetings in time zones",
  "The campus is so big sometimes your lecture and your motivation are miles apart",
  "A Waterloo degree is just caffeine goose stories and lots of LinkedIn connections",
  "Surviving First-Year Orientation Conference the first true midterm",
  "Waterloo's mascot is King Warrior but the real mascot is King Goose",
  "Best campus pickup line wanna co-op together",
  "Eight months of classes and four months of realizing you actually like sleep",
  "Your Waterloo Card doubles as a scraper for winter windshield frost",
  "The Portal app's real feature is reminding you of all your overdue assignments",
  "Student Life Centre is where life is waiting for food at lunch rush",
  "You haven't suffered until you've raced a goose to class and lost",
  "Final exam security is tighter than the line for free pizza at club fair",
  "Waterloo Engineering where rulers are used for measuring stress",
  "Midterm season at Waterloo ten students nine coffee cups one desperate prayer",
  "Chemistry Physics Hall aka Causing Panic Hour during finals",
  "Co-op interviews more plot twists than a Netflix drama",
  "Dana Porter library was built by caffeinated raccoons",
  "Professors say attendance isn't mandatory students say Netflix is",
  "Waterloo meetings this could've been an email",
  "Four-month terms just long enough to forget what happiness feels like",
  "Student budget at Waterloo ramen hope and geese intimidation techniques",
  "Waterloo fitness is running to class because you missed the bus again",
  "Davis Centre a place of learning napping and existential crisis",
  "If you make it through Waterloo finals you can survive anything except geese",
  "Waterloo's campus is green so are the geese after eating all your snacks",
  "All-nighters because the only thing faster than your deadlines is campus Wi-Fi after 2 am",
  "Waterloo co-op jobs taught me LinkedIn stalking is a survival skill",
  "Lost at Waterloo follow the sound of groans and caffeine machines",
  "Even Waterloo's squirrels look stressed during finals",
  "Student government elections more drama than a group project",
  "Waterloo hackathons caffeine code and geese memes",
  "One hundred clubs at Waterloo but not a club for Surviving MATH135",
  "Waterloo's weather goes from summer to winter in 24 hours",
  "The most popular major at Waterloo is complaining about Waterloo",
  "Waterloo's food trucks the real reason students survive midterms",
  "If you trip on campus don't worry the geese are judging you more than your peers",
  "Course enrollment Hunger Games for nerds",
  "Waterloo's unofficial motto sleep is for Laurier students",
  "First-year dorms friendships are forged and instant noodles reign",
  "DC library come for the books stay for the breakdowns",
  "If you think Ring Road is endless wait until you see your student debt",
  "Tradition get lost at least twice in the Math and Computer building",
  "SLC microwaves proof Waterloo cares about student health sort of",
  "Waterloo fitness climbing stairs in DP when the elevator's broken again",
  "All campus legends start with one time at co-op",
  "Campus map tip disregard locations follow Wi-Fi signals",
  "Waterloo study tip sell your soul to the geese for better grades",
  "Student discounts not on tuition but maybe on goose therapy",
  "Waterloo student hack save money by borrowing textbooks or memories from upper-years",
  "Finals when even the campus geese look for escape routes",
  "Waterloo's MathSoc parties calculated fun guaranteed puns",
  "Dining hall chicken or beef can I get a third option not here",
  "The real campus hierarchy professors geese then students",
  "Waterloo events free pizza free pens and free emotional breakdowns",
  "If you walk the full Ring Road that counts as cardio right",
  "Waterloo where your co-op job might pay less than your rent",
  "Group projects where two people do the work one schedules meetings and one is a goose",
  "Waterloo's weather is the only thing less predictable than your GPA",
  "Most students study at DP after dark the rest are just haunting the halls",
  "Club fair tip sign up for free stuff commit to none",
  "If you haven't had coffee spilled on you at Waterloo are you even a student",
  "Waterloo orientation where you meet your next four months of stress",
  "All-nighters in MC tradition necessity regret",
  "Waterloo's quantum computing research bigger mysteries than CIS final exams",
  "Midterms the time when everyone becomes an expert in creative grading",
  "If Google went down at Waterloo so would civilization",
  "SLC lounge furniture older than most first-year students",
  "Waterloo's gym where the strongest muscle is your will to survive finals",
  "Every Waterloo group chat ten percent memes ninety percent panicked questions",
  "Who needs sleep when you have club meetings co-op apps and three group projects",
  "Waterloo's motto inspiring minds crushing souls since 1957",
  "Waterloo study hacks find the Wi-Fi sweet spot avoid goose territory",
  "Best time to see Waterloo Park when the geese are asleep good luck",
  "Student deals buy two textbooks get your dreams crushed free",
  "Waterloo's unofficial rival is the Laurier coffee shop line",
  "Waterloo career fair for jobs you'll apply to interviews you'll panic about",
  "SLC the best spot for group brainstorming and nap-taking",
  "Waterloo's real exam crossing Ring Road during rush hour",
  "If you make a typo racing at WaterlooType blame campus Wi-Fi",
  "Waterloo's biggest secret alert status for caffeinated raccoons",
  "If you survived a term at Waterloo what's Hogwarts to you",
  "Finals stress measured in cups of Tim Hortons and midterm memes",
  "Waterloo success formula study work run from geese survive",
  "First-years lost on campus fourth-years lost in existential dread",
  "WaterlooType leaderboard for proving you really are faster than geese",
  "Secret to Waterloo graduation hide from the geese until convocation",
  "Waterloo files the truth about food trucks is out there",
  "Waterloo isn't just a university it's a vibe mostly exhaustion some geese",
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
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(() => Math.floor(Math.random() * prompts.length));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPrompt = prompts[currentPromptIndex];

  const modes = useMemo(
    () => [
      { id: "time", icon: Clock, label: "time" },
      { id: "words", icon: Hash, label: "words" },
      { id: "quote", icon: Quote, label: "quote" },
      { id: "zen", icon: Zap, label: "zen" },
      { id: "custom", icon: PenTool, label: "custom" },
    ],
    [],
  );

  const timeOptions = useMemo(() => [15, 30, 60, 120], []);

  const computeStats = useCallback((text: string, promptText: string, startedAt: number | null): Stats => {
    const totalChars = text.length;
    let correctChars = 0;

    for (let index = 0; index < text.length; index += 1) {
      if (text[index] === promptText[index]) {
        correctChars += 1;
      }
    }

    const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
    const now = Date.now();
    const elapsedMs = startedAt ? Math.max(now - startedAt, 0) : 0;
    const elapsedMinutes = elapsedMs > 0 ? elapsedMs / 60000 : 0;
    const wpm = elapsedMinutes > 0 && words > 0 ? Math.round(words / elapsedMinutes) : 0;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;

    return {
      wpm,
      accuracy: Number(accuracy.toFixed(1)),
      correctChars,
      totalChars,
      words,
      elapsedMs,
    };
  }, []);

  const finishTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!startTime) {
      return;
    }

    const stats = computeStats(typedText, currentPrompt, startTime);
    setFinalStats(stats);
    setTestStarted(false);
    setTestFinished(true);
  }, [computeStats, currentPrompt, startTime, typedText]);

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

      if (options?.nextPrompt) {
        setCurrentPromptIndex((previous) => getRandomPromptIndex(previous));
      }
    },
    [duration, getRandomPromptIndex],
  );

  const handleUserCountRefresh = useCallback(async () => {
    setIsFetchingUsers(true);
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Failed to load total users", error);
    } else {
      setTotalUsers(count ?? 0);
    }
    setIsFetchingUsers(false);
  }, []);

  useEffect(() => {
    handleUserCountRefresh();
    const interval = setInterval(handleUserCountRefresh, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, [handleUserCountRefresh]);

  useEffect(() => {
    if (!testStarted || !startTime) {
      return;
    }

    timerRef.current = setInterval(() => {
      const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(duration - secondsElapsed, 0);
      setTimeLeft(remaining);
      if (remaining === 0) {
        finishTest();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [duration, finishTest, startTime, testStarted]);

  useEffect(() => {
    if (!testStarted) {
      setTimeLeft(duration);
    }
  }, [duration, testStarted]);

  const liveStats = useMemo(() => {
    if (!testStarted || !startTime) {
      return finalStats ?? initialStats;
    }
    return computeStats(typedText, currentPrompt, startTime);
  }, [computeStats, currentPrompt, finalStats, startTime, testStarted, typedText]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (!testStarted) {
      setTestStarted(true);
      setTestFinished(false);
      setStartTime(Date.now());
      setFinalStats(null);
    }
    setTypedText(value);
  };

  const handleSaveScore = async () => {
    if (!finalStats || !testFinished) {
      toast.info("Finish a test before uploading your score.");
      return;
    }
    if (!user) {
      toast.info("Create an account to upload your scores and compete on the leaderboard.");
      return;
    }

    setIsSaving(true);
    const incorrectChars = Math.max(finalStats.totalChars - finalStats.correctChars, 0);
    const extraChars = Math.max(finalStats.totalChars - currentPrompt.length, 0);
    const missedChars = Math.max(currentPrompt.length - finalStats.totalChars, 0);

    try {
      const { error } = await supabase.from("typing_tests").insert({
        user_id: user.id,
        test_mode: testMode,
        test_duration: duration,
        language: "english",
        wpm: finalStats.wpm,
        raw_wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        word_count: finalStats.words,
        correct_chars: finalStats.correctChars,
        incorrect_chars: incorrectChars,
        extra_chars: extraChars,
        missed_chars: missedChars,
        consistency: null,
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Join {totalUsers !== null ? totalUsers.toLocaleString() : "…"} Waterloo Warriors
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Type your heart out with Waterloo-flavoured prompts. Save your score when you're signed in.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleUserCountRefresh}
            >
              <RefreshCw className={`h-4 w-4 ${isFetchingUsers ? "animate-spin" : ""}`} />
              Refresh Count
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={testMode === mode.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setTestMode(mode.id as TestMode);
                    handleRestart();
                  }}
                  className={`${
                    testMode === mode.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              );
            })}
          </div>

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

            <div className="font-mono text-xl sm:text-2xl leading-relaxed min-h-[120px] sm:min-h-[160px] mb-6 whitespace-pre-wrap break-words">
              {renderPrompt()}
            </div>

            <Textarea
              value={typedText}
              onChange={handleTextChange}
              placeholder="Start typing to begin the test..."
              className="bg-background border-border focus-visible:ring-primary min-h-[140px] font-mono text-lg"
              autoFocus
            />

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
              </div>
              <Button
                onClick={handleSaveScore}
                disabled={!finalStats || !testFinished || isSaving || !user}
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

          <div className="mt-8 text-center space-y-2 text-sm text-muted-foreground">
            <p>tab + enter - restart test</p>
            <p>esc or cmd + shift + p - command palette</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TypingTest;
