export function RoomPreferenceHeader() {
  return (
    <div className="text-center space-y-1.5">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
        What are you{" "}
        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          craving?
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Select categories, budget, and search area to discover places for your group.
      </p>
    </div>
  )
}
