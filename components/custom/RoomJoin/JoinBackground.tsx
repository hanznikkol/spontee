export function JoinBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10">
      {/* Top-left soft pink glow */}
      <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-pink-500/15 blur-3xl" />

      {/* Center-right soft blue glow */}
      <div className="absolute top-1/3 -right-40 h-[450px] w-[450px] rounded-full bg-blue-500/15 blur-3xl" />

      {/* Bottom soft purple glow */}
      <div className="absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-purple-500/15 blur-3xl" />
    </div>
  )
}

