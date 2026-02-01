import { forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import shellstarLogo from "@/assets/shellstar-logo.png";
import sccIcon from "@/assets/scc-icon.gif";
import sccLogo from "@/assets/scc-logo.gif";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "scc";
  customSrc?: string | null;
  /** Disable click navigation to dashboard */
  disableNavigation?: boolean;
}

const sizeClasses = {
  full: {
    sm: "h-10",
    md: "h-14",
    lg: "h-28",
    xl: "h-36",
  },
  icon: {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  },
  scc: {
    sm: "h-10",
    md: "h-14",
    lg: "h-20",
    xl: "h-28",
  },
};

const defaultLogos = {
  full: shellstarLogo,
  icon: sccIcon,
  scc: sccLogo,
};

const altTexts = {
  full: "ShellStar Custom Cabinets",
  icon: "SCC",
  scc: "SCC Logo",
};

interface LogoImgProps extends LogoProps {
  /** CSS class for dark mode filter - applied when isDarkMode */
  filterClass?: string;
}

export const Logo = forwardRef<HTMLImageElement, LogoImgProps>(({ 
  className = "", 
  size = "md", 
  variant = "full",
  customSrc = null,
  filterClass = "",
  disableNavigation = false
}, ref) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  const logoSrc = customSrc || defaultLogos[variant];
  const altText = customSrc ? "Organization Logo" : altTexts[variant];

  const handleClick = () => {
    if (disableNavigation) return;
    
    // Navigate to the main dashboard
    if (slug) {
      navigate(`/dashboard/${slug}`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <img
      ref={ref}
      src={logoSrc}
      alt={altText}
      onClick={handleClick}
      className={`${sizeClasses[variant][size]} w-auto object-contain ${filterClass} ${className} ${!disableNavigation ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
    />
  );
});

Logo.displayName = "Logo";
