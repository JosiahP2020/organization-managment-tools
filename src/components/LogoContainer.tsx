import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LogoContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * A container that adds a light gray background in dark mode for better logo visibility.
 * Use this to wrap logos that may not be visible against dark backgrounds.
 */
export const LogoContainer = forwardRef<HTMLDivElement, LogoContainerProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-2 dark:bg-[#242424]",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

LogoContainer.displayName = "LogoContainer";
