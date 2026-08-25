export function SwipeIndicator() {
  return (
    <span className="relative flex h-3.5 w-4 items-center overflow-hidden">
      <span className="absolute h-3 w-2.5 rounded-xs border border-current opacity-30" />

      <span
        className="
          absolute h-3 w-2.5 rounded-xs
          border border-current bg-current/10
          animate-[swipe_1.5s_ease-in-out_infinite]
        "
      />
    </span>
  )
}