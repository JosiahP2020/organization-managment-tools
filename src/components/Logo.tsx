import shellstarLogo from "@/assets/shellstar-logo.png";
import sccIcon from "@/assets/scc-icon.gif";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

const sizeClasses = {
  full: {
    sm: "h-10",
    md: "h-14",
    lg: "h-28",
  },
  icon: {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  },
};

export const Logo = ({ className = "", size = "md", variant = "full" }: LogoProps) => {
  const logoSrc = variant === "full" ? shellstarLogo : sccIcon;
  const altText = variant === "full" ? "ShellStar Custom Cabinets" : "SCC";
  
  return (
    <img
      src={logoSrc}
      alt={altText}
      className={`${sizeClasses[variant][size]} w-auto object-contain ${className}`}
    />
  );
};
