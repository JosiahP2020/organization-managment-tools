import shellstarLogo from "@/assets/shellstar-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-10",
  md: "h-14",
  lg: "h-20",
};

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  return (
    <img
      src={shellstarLogo}
      alt="ShellStar Custom Cabinets"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
};
