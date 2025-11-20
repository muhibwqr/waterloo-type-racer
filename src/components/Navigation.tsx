import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Keyboard, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthDialog from "./auth/AuthDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Keyboard className="w-6 h-6 text-primary transition-colors" />
            <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              GooseType
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Type
            </Link>
            <Link
              to="/leaderboard"
              className={`text-sm transition-colors ${
                isActive('/leaderboard') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/about"
              className={`text-sm transition-colors ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              About
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Bell className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowAuthDialog(true)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
};

export default Navigation;
