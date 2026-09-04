"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  align?: "start" | "center" | "end"
}

export function ThemeToggle({ className, align = "end" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 size-8",
          className
        )}
        aria-label="Toggle theme"
      >
        <span className="size-4" />
      </Button>
    )
  }

  const currentIcon =
    theme === "system" ? (
      <Monitor className="size-4" />
    ) : resolvedTheme === "dark" ? (
      <Moon className="size-4" />
    ) : (
      <Sun className="size-4" />
    )

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 size-8 transition-colors",
            className
          )}
          aria-label={`Current theme: ${theme}. Click to change theme.`}
        >
          {currentIcon}
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={8}
          className="z-50 min-w-[130px] overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-1.5 text-card-foreground shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <DropdownMenuPrimitive.Item
            onClick={() => setTheme("light")}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none transition-colors select-none",
              theme === "light"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Sun className="size-3.5" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="size-3 text-primary" />}
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item
            onClick={() => setTheme("dark")}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none transition-colors select-none",
              theme === "dark"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Moon className="size-3.5" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="size-3 text-primary" />}
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item
            onClick={() => setTheme("system")}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none transition-colors select-none",
              theme === "system"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Monitor className="size-3.5" />
              <span>System</span>
            </div>
            {theme === "system" && <Check className="size-3 text-primary" />}
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}

/**
 * Inline 3-way segmented control for mobile navigation drawers or footer
 */
export function ThemeSegmentedControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn("h-8 rounded-xl bg-muted/40 animate-pulse", className)} />
  }

  const options: Array<{ value: "light" | "dark" | "system"; label: string; icon: React.ReactNode }> = [
    { value: "light", label: "Light", icon: <Sun className="size-3.5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="size-3.5" /> },
    { value: "system", label: "System", icon: <Monitor className="size-3.5" /> },
  ]

  return (
    <div className={cn("flex items-center rounded-2xl bg-muted/50 p-1 border border-border/60", className)}>
      {options.map((opt) => {
        const isActive = theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium transition-all select-none cursor-pointer",
              isActive
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
