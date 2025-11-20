import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Keyboard, Trophy, User, Home, Info } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    {
      id: "home",
      label: "Go to Home",
      icon: Home,
      action: () => {
        navigate("/");
        onOpenChange(false);
      },
    },
    {
      id: "leaderboard",
      label: "View Leaderboard",
      icon: Trophy,
      action: () => {
        navigate("/leaderboard");
        onOpenChange(false);
      },
    },
    {
      id: "profile",
      label: "View Profile",
      icon: User,
      action: () => {
        navigate("/profile");
        onOpenChange(false);
      },
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      action: () => {
        navigate("/about");
        onOpenChange(false);
      },
    },
  ];

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        commands[selectedIndex]?.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, commands]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Command Palette
          </DialogTitle>
          <DialogDescription>
            Navigate quickly using arrow keys and Enter
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 mt-4">
          {commands.map((command, index) => {
            const Icon = command.icon;
            const isSelected = index === selectedIndex;
            return (
              <Button
                key={command.id}
                variant={isSelected ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={command.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {command.label}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;

