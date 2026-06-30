'use client'

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type RoomVisibilityProps = {
  value: "public" | "private"
  onChange: (value: "public" | "private") => void
}

export function RoomVisibility({ value, onChange }: RoomVisibilityProps) {
  return (
    <div className="space-y-2">
      <Label>Visibility</Label>

      <div className="grid grid-cols-2 gap-2">
        
        {/* PUBLIC */}
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange("public")}
          className={cn(
            "relative h-auto flex-col items-start rounded-2xl p-4 text-left transition-all",
            value === "public"
              ? "border-primary bg-primary/5 shadow-sm hover:bg-primary/5"
              : "border-border hover:bg-muted/40"
          )}
        >
          <div className="text-lg">🌍</div>

          <div className="mt-2 font-semibold text-sm">
            Public
          </div>

          <div className="text-xs text-muted-foreground">
            Anyone can join
          </div>

          {value === "public" && (
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>

        {/* PRIVATE */}
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange("private")}
          className={cn(
            "relative h-auto flex-col items-start rounded-2xl p-4 text-left transition-all",
            value === "private"
              ? "border-primary bg-primary/5 shadow-sm hover:bg-primary/5"
              : "border-border hover:bg-muted/40"
          )}
        >
          <div className="text-lg">🔒</div>

          <div className="mt-2 font-semibold text-sm">
            Private
          </div>

          <div className="text-xs text-muted-foreground">
            Requires password
          </div>

          {value === "private" && (
            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>
    </div>
  )
}