import { Slider } from "@/components/ui/slider"
import { RADIUS_VALUES } from "@/lib/room/create/preference/location"

export function LocationRadius({ radius, onChange }: { radius: number, onChange: (radius: number) => void}) {

  const selectedIndex = RADIUS_VALUES.indexOf(radius)
  function formatRadius(radius: number) {
    if (radius < 1000) return `${radius} m`
    return `${radius / 1000} km`
  }
  return (
    <div className="space-y-3 rounded-2xl border bg-background p-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Search Radius</h3>
          <p className="text-xs text-muted-foreground">
            How far should we search?
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-primary">
          {formatRadius(radius)}
        </span>
      </div>

      <Slider
        value={[selectedIndex]}
        min={0}
        max={RADIUS_VALUES.length - 1}
        step={1}
        onValueChange={([nextIndex]) =>
          onChange(RADIUS_VALUES[nextIndex] ?? radius)
        }
        aria-label="Search radius"
      />

      <div className="flex justify-between text-[0.7rem] text-muted-foreground">
        {RADIUS_VALUES.map((value) => (
          <span key={value}>{formatRadius(value)}</span>
        ))}
      </div>
    </div>
  )
}