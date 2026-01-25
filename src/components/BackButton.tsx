import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export function BackButton({ fallbackPath, className = "" }: BackButtonProps) {
  const navigate = useNavigate();
  const { organization } = useAuth();

  // Default fallback to the organization dashboard
  const defaultFallback = organization?.slug ? `/dashboard/${organization.slug}` : "/";

  const handleBack = () => {
    // Always navigate to the dashboard as a reliable back action
    navigate(fallbackPath || defaultFallback);
  };

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
