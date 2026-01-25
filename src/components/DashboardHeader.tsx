import { Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useState } from "react";
import shellstarLogo from "@/assets/shellstar-logo.png";

export function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-40">
        {/* Menu Button - Left */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="h-11 w-11 text-foreground hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo - Center */}
        <Link to="/dashboard" className="flex items-center">
          <img
            src={shellstarLogo}
            alt="ShellStar Custom Cabinets"
            className="h-8 w-auto"
          />
        </Link>

        {/* Settings Button - Right */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-11 w-11 text-foreground hover:bg-accent"
        >
          <Link to="/settings/account" aria-label="Settings">
            <Settings className="h-6 w-6" />
          </Link>
        </Button>
      </header>

      <NavigationMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
