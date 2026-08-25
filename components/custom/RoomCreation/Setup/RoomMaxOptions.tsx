import { Slider } from "@/components/ui/slider"
import { MAX_OPTIONS_VALUES } from "@/lib/room/create/types/constants/max-options-const"

interface RoomMaxOptionsProps {
  maxOptions: number
  onChange: (maxOptions: number) => void
}

export function RoomMaxOptions({ maxOptions, onChange }: RoomMaxOptionsProps) {
  const selectedIndex = MAX_OPTIONS_VALUES.indexOf(maxOptions)

  return (
    <div className="space-y-3 rounded-2xl border bg-background p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            Maximum Options
          </h3>

          <p className="text-xs text-muted-foreground">
            How many places should we find?
          </p>
        </div>

        <span className="shrink-0 text-sm font-semibold text-primary">
          {maxOptions}
        </span>
      </div>

      <Slider
        value={[selectedIndex === -1 ? 1 : selectedIndex]}
        min={0}
        max={MAX_OPTIONS_VALUES.length - 1}
        step={1}
        onValueChange={([nextIndex]) =>
          onChange(MAX_OPTIONS_VALUES[nextIndex] ?? maxOptions)
        }
        aria-label="Maximum options"
      />

      <div className="flex justify-between text-[0.7rem] text-muted-foreground">
        {MAX_OPTIONS_VALUES.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
    </div>
  )
}