export function RoomHeader() {
  return (
    <div className="text-center space-y-1.5">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
        Start your{" "}
        <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          room
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Enter your display name and group details to get started.
      </p>
    </div>
  )
}

export default RoomHeader