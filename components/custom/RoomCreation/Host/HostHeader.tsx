export default function HostHeader() {
  return (
    <div className="text-center space-y-1.5">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
        What&apos;s your{" "}
        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          name?
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Choose the display name your friends and guests will see when they join your room.
      </p>
    </div>
  )
}