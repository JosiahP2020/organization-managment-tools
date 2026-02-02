import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo } from "react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath = "/", className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate the parent path based on current URL structure
  // This is more reliable than browser history which can be corrupted by dialogs
  const parentPath = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Pattern: /dashboard/:slug/... -> go up one level
    if (pathParts.length > 2 && pathParts[0] === 'dashboard') {
      // Remove the last segment to get parent
      return '/' + pathParts.slice(0, -1).join('/');
    }
    
    // For paths like /settings/account -> /settings
    if (pathParts.length > 1) {
      return '/' + pathParts.slice(0, -1).join('/');
    }
    
    return fallbackPath;
  }, [location.pathname, fallbackPath]);

  const handleBack = useCallback(() => {
    // Always use calculated parent path for reliable navigation
    navigate(parentPath);
  }, [navigate, parentPath]);

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