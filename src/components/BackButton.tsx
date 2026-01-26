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
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Check if we're in an SOP Guide (path contains 'gemba' segment)
    const gembaIndex = pathParts.indexOf('gemba');
    
    // Check if we're in a follow-up-list checklist
    // Path: /dashboard/{org}/shop-install/projects/{projectId}/follow-up-list/{checklistId}
    const followUpIndex = pathParts.indexOf('follow-up-list');
    
    if (gembaIndex !== -1) {
      // For SOP Guides, go back to the category page (before 'gemba')
      const parentPath = '/' + pathParts.slice(0, gembaIndex).join('/');
      navigate(parentPath);
    } else if (followUpIndex !== -1) {
      // For follow-up list checklists, go back to the project page (before 'follow-up-list')
      const parentPath = '/' + pathParts.slice(0, followUpIndex).join('/');
      navigate(parentPath);
    } else if (pathParts.length > 2) {
      // Regular behavior: remove the last segment
      const parentPath = '/' + pathParts.slice(0, -1).join('/');
      navigate(parentPath);
    } else {
      navigate(fallbackPath, { replace: true });
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
