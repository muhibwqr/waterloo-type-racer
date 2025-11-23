import { Link, useLocation } from "react-router-dom";
import { Keyboard } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
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

        {/* Right Side - Empty for now */}
        <div className="flex items-center gap-4">
          {/* No auth buttons */}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
