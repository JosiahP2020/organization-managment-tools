import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath = "/", className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = useCallback(() => {
    // Use browser history to go to actual previous page
    // Only use history if we have more than one entry (meaning we navigated within the app)
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback: navigate to parent path
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 2) {
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    }
  }, [navigate, fallbackPath, location.pathname]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </Button>
  );
}