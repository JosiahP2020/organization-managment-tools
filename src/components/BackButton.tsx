import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef } from "react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath = "/", className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigatedRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);

  // Track if we've navigated within the app
  useEffect(() => {
    if (previousPathRef.current !== null && previousPathRef.current !== location.pathname) {
      hasNavigatedRef.current = true;
    }
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleBack = useCallback(() => {
    // Simple approach: try to go back, if we have in-app history use it
    // Otherwise navigate to the fallback path
    if (hasNavigatedRef.current) {
      navigate(-1);
    } else {
      // No in-app navigation history, go to fallback
      navigate(fallbackPath, { replace: true });
    }
  }, [navigate, fallbackPath]);

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
