"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";

interface InstallButtonProps {
  className?: string;
  variant?: "desktop" | "mobile" | "footer";
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

  if (variant === "mobile") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={
          className ??
          "w-full justify-center rounded-xl text-xs text-muted-foreground hover:text-foreground"
        }
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Install Spontee
      </Button>
    );
  }

  if (variant === "footer") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInstall}
        className={
          className ??
          "rounded-xl border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition h-auto"
        }
      >
        <Download className="mr-1.5 h-3 w-3" />
        Install Spontee
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleInstall}
      className={
        className ??
        "rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 text-xs font-medium"
      }
    >
      <Download className="mr-1.5 h-3.5 w-3.5" />
      Install Spontee
    </Button>
  );
}

export default InstallButton;
