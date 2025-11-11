import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Clock, Hash, Quote, Zap, PenTool, Settings } from "lucide-react";

const TypingTest = () => {
  const { user } = useAuth();
  const [testMode, setTestMode] = useState<'time' | 'words' | 'quote' | 'zen' | 'custom'>('time');
  const [duration, setDuration] = useState(30);
  const [testStarted, setTestStarted] = useState(false);

  const modes = [
    { id: 'time', icon: Clock, label: 'time' },
    { id: 'words', icon: Hash, label: 'words' },
    { id: 'quote', icon: Quote, label: 'quote' },
    { id: 'zen', icon: Zap, label: 'zen' },
    { id: 'custom', icon: PenTool, label: 'custom' },
  ];

  const timeOptions = [15, 30, 60, 120];

  const sampleText = "The quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Test Configuration Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={testMode === mode.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTestMode(mode.id as any)}
                  className={`${
                    testMode === mode.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              );
            })}
          </div>

          {/* Time Options */}
          {testMode === 'time' && (
            <div className="flex items-center justify-center gap-3">
              {timeOptions.map((time) => (
                <Button
                  key={time}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDuration(time)}
                  className={`${
                    duration === time
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="max-w-4xl mx-auto mb-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            🌐 english
          </Button>
        </div>

        {/* Typing Area */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-12 shadow-lg border border-border">
            {!testStarted ? (
              <div className="text-center space-y-6">
                <div className="font-mono text-2xl leading-relaxed text-muted-foreground">
                  {sampleText}
                </div>
                <p className="text-muted-foreground">
                  Click here or press any key to focus
                </p>
              </div>
            ) : (
              <div className="font-mono text-2xl leading-relaxed">
                <span className="text-text-correct">The quick </span>
                <span className="text-primary relative">
                  brown
                  <span className="absolute -left-0.5 top-0 w-0.5 h-full bg-primary animate-pulse"></span>
                </span>
                <span className="text-muted-foreground"> fox jumps over the lazy dog</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center space-y-2 text-sm text-muted-foreground">
            <p>tab + enter - restart test</p>
            <p>esc or cmd + shift + p - command line</p>
          </div>

          {/* Not Logged In Banner */}
          {!user && (
            <div className="mt-8 bg-primary/10 border border-primary rounded-lg p-6 text-center">
              <p className="text-foreground mb-4">
                🎯 Create an account to save your scores and compete on the leaderboard!
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default TypingTest;
