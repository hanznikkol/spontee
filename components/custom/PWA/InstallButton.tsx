"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";
import { cn } from "@/lib/utils";

interface InstallButtonProps {
  className?: string;
  variant?: "desktop" | "tablet" | "header-mobile" | "mobile" | "footer";
  onInstalled?: () => void;
}

export function InstallButton({
  className,
  variant = "desktop",
  onInstalled,
}: InstallButtonProps) {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await install();
    if (installed && onInstalled) {
      onInstalled();
    }
  };

  // Base pink background + border treatment consistent across mobile, tablet, and desktop
  const pinkPillClasses = cn(
    "rounded-xl font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 transition-all flex items-center shrink-0 shadow-xs cursor-pointer",
    className
  );

  if (variant === "header-mobile") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={cn(pinkPillClasses, "px-2.5 h-8 text-xs gap-1")}
        title="Install Spontee"
        aria-label="Install Spontee"
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden min-[380px]:inline text-[11px]">Install</span>
      </Button>
    );
  }

  if (variant === "tablet") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={cn(pinkPillClasses, "px-2.5 h-8 sm:h-8.5 text-xs gap-1.5")}
        title="Install Spontee"
        aria-label="Install Spontee"
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span>Install Spontee</span>
      </Button>
    );
  }

  if (variant === "mobile") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={cn(
          pinkPillClasses,
          "w-full justify-center py-2.5 h-auto text-xs gap-1.5"
        )}
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span>Install Spontee</span>
      </Button>
    );
  }

  if (variant === "footer") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={cn(
          "rounded-xl border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition h-auto",
          className
        )}
      >
        <Download className="mr-1.5 h-3 w-3" />
        Install Spontee
      </Button>
    );
  }

  // Desktop default
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleInstall}
      className={cn(pinkPillClasses, "px-3 h-8.5 text-xs gap-1.5")}
      title="Install Spontee"
      aria-label="Install Spontee"
    >
      <Download className="h-3.5 w-3.5 shrink-0" />
      <span>Install Spontee</span>
    </Button>
  );
}

export default InstallButton;
