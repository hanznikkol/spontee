import { Sparkles } from "lucide-react"

export function RoomPreferenceHeader() {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Add Your Preference</h1>
        <p className="text-sm text-muted-foreground">
          Create the choices everyone will vote on.
        </p>
      </div>
    </div>
  )
}
