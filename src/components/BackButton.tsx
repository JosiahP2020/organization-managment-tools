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
    
    // Check if we're in a project sub-page (follow-up-list or pipe-drawer)
    // Path: /dashboard/{org}/shop-install/projects/{projectId}/follow-up-list or /pipe-drawer
    const projectsIndex = pathParts.indexOf('projects');
    const isInProjectSubPage = projectsIndex !== -1 && 
      (pathParts.includes('follow-up-list') || pathParts.includes('pipe-drawer'));
    
    if (gembaIndex !== -1) {
      // For SOP Guides, go back to the category page (before 'gemba')
      const parentPath = '/' + pathParts.slice(0, gembaIndex).join('/');
      navigate(parentPath);
    } else if (isInProjectSubPage) {
      // For project sub-pages, go directly to projects list (skip project detail)
      const parentPath = '/' + pathParts.slice(0, projectsIndex + 1).join('/');
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
