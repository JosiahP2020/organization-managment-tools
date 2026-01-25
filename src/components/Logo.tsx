import { forwardRef } from "react";
import shellstarLogo from "@/assets/shellstar-logo.png";
import sccIcon from "@/assets/scc-icon.gif";
import sccLogo from "@/assets/scc-logo.gif";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "scc";
  customSrc?: string | null;
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
  filterClass = ""
}, ref) => {
  const logoSrc = customSrc || defaultLogos[variant];
  const altText = customSrc ? "Organization Logo" : altTexts[variant];
  
  return (
    <img
      ref={ref}
      src={logoSrc}
      alt={altText}
      className={`${sizeClasses[variant][size]} w-auto object-contain ${filterClass} ${className}`}
    />
  );
});

Logo.displayName = "Logo";
