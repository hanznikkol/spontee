"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Star,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  LogOut,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  ArrowUpDown,
} from "lucide-react"
import { Feedback, FeedbackStats, FeedbackSortOption } from "@/lib/feedback/types/feedback.types"
import { logoutAdminAction, deleteFeedbackAction } from "@/lib/feedback/actions/admin-auth.actions"
import { ThemeToggle } from "@/components/custom/Theme/ThemeToggle"
import { cn } from "@/lib/utils"

interface AdminFeedbackViewProps {
  initialFeedback: Feedback[]
  initialStats: FeedbackStats
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return "Yesterday"
  if (diffDay < 30) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatExactDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const RATING_COLORS: Record<number, { text: string; bg: string; border: string }> = {
  5: { text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  4: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  3: { text: "text-yellow-500 dark:text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  2: { text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  1: { text: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
}

export function AdminFeedbackView({ initialFeedback, initialStats }: AdminFeedbackViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRating, setSelectedRating] = useState<number | "all">("all")
  const [hasCommentOnly, setHasCommentOnly] = useState(false)
  const [sortBy, setSortBy] = useState<FeedbackSortOption>("newest")

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleLogout = async () => {
    await logoutAdminAction()
    router.refresh()
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    try {
      await deleteFeedbackAction(itemToDelete)
      setItemToDelete(null)
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  // Filtered and sorted feedback list
  const filteredFeedback = useMemo(() => {
    return initialFeedback
      .filter((item) => {
        // Rating filter
        if (selectedRating !== "all" && item.rating !== selectedRating) {
          return false
        }
        // Has comment filter
        if (hasCommentOnly && (!item.message || item.message.trim().length === 0)) {
          return false
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const messageMatch = item.message?.toLowerCase().includes(q)
          const nameMatch = item.user_name?.toLowerCase().includes(q)
          if (!messageMatch && !nameMatch) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        if (sortBy === "highest") {
          return b.rating - a.rating
        }
        if (sortBy === "lowest") {
          return a.rating - b.rating
        }
        return 0
      })
  }, [initialFeedback, selectedRating, hasCommentOnly, searchQuery, sortBy])

  // Positive satisfaction percentage (4 & 5 stars)
  const positivePercentage = useMemo(() => {
    if (initialStats.total === 0) return 0
    const positiveCount = (initialStats.ratingBreakdown[4] || 0) + (initialStats.ratingBreakdown[5] || 0)
    return Math.round((positiveCount / initialStats.total) * 100)
  }, [initialStats])

  return (
    <div className="min-h-screen pb-16">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold tracking-tight text-lg text-foreground hover:opacity-90 transition">
              Spont<span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">ee</span>
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/20 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-500">
              <Sparkles className="h-3 w-3" />
              Feedback Hub
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              className="rounded-xl text-xs font-medium gap-1.5 border-border/80"
              title="Refresh Feedback Data"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* TOTAL SUBMISSIONS */}
          <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {initialStats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center ring-1 ring-blue-500/20">
                <MessageSquare className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* AVERAGE RATING */}
          <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {initialStats.averageRating.toFixed(1)}
                  </p>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-1 ring-amber-500/20">
                <Star className="h-6 w-6 fill-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* POSITIVE SATISFACTION */}
          <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Positive Sentiment</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {positivePercentage}%
                  </p>
                  <span className="text-xs text-muted-foreground">4★ & 5★</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-1 ring-emerald-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          {/* WITH COMMENTS */}
          <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Written Comments</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {initialStats.withMessageCount}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    ({initialStats.total > 0 ? Math.round((initialStats.withMessageCount / initialStats.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center ring-1 ring-purple-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RATING BREAKDOWN BAR */}
        <Card className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center justify-between">
              <span>Rating Distribution</span>
              <span className="text-xs text-muted-foreground font-normal">Click a bar to filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = initialStats.ratingBreakdown[star] || 0
              const percentage = initialStats.total > 0 ? Math.round((count / initialStats.total) * 100) : 0
              const isFilterActive = selectedRating === star

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(selectedRating === star ? "all" : star)}
                  className={cn(
                    "w-full flex items-center gap-3 p-1.5 rounded-xl transition cursor-pointer text-left group",
                    isFilterActive ? "bg-muted/80 ring-1 ring-primary/40" : "hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-1 w-10 text-xs font-semibold text-foreground shrink-0">
                    <span>{star}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        star >= 4
                          ? "bg-linear-to-r from-emerald-500 to-amber-500"
                          : star === 3
                          ? "bg-yellow-500"
                          : "bg-rose-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="w-16 text-right text-xs font-medium text-muted-foreground shrink-0 group-hover:text-foreground transition">
                    {count} <span className="text-[11px] text-muted-foreground/60">({percentage}%)</span>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* CONTROLS: SEARCH, FILTERS & SORT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback text..."
              className="pl-10 h-10 rounded-2xl border-input bg-card/85 text-xs sm:text-sm"
            />
          </div>

          {/* RATING FILTER PILLS & COMMENT TOGGLE */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border border-border/60">
              <button
                type="button"
                onClick={() => setSelectedRating("all")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-xl transition cursor-pointer",
                  selectedRating === "all" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({initialStats.total})
              </button>
              {([5, 4, 3, 2, 1] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRating(r)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-0.5",
                    selectedRating === r ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{r}</span>
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                </button>
              ))}
            </div>

            <Button
              variant={hasCommentOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setHasCommentOnly(!hasCommentOnly)}
              className={cn(
                "rounded-2xl text-xs h-9 px-3 gap-1.5 transition",
                hasCommentOnly ? "bg-primary text-primary-foreground" : "border-border/80 text-muted-foreground"
              )}
            >
              <Filter className="h-3 w-3" />
              <span>With Comments</span>
            </Button>

            {/* SORT SELECTOR */}
            <div className="flex items-center gap-1 bg-card/85 border border-border/80 rounded-2xl px-2.5 h-9 text-xs">
              <ArrowUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as FeedbackSortOption)}
                className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-1"
                aria-label="Sort feedback list"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK CARDS LIST */}
        <div className="space-y-3.5">
          {filteredFeedback.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">No feedback found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {initialStats.total === 0
                    ? "No feedback has been submitted yet. Submissions from the landing page will appear here in real time."
                    : "No feedback matches the selected filters. Try adjusting your search query or rating filter."}
                </p>
              </div>
              {(selectedRating !== "all" || hasCommentOnly || searchQuery.trim()) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRating("all")
                    setHasCommentOnly(false)
                    setSearchQuery("")
                  }}
                  className="rounded-xl text-xs mt-2"
                >
                  Reset Filters
                </Button>
              )}
            </Card>
          ) : (
            filteredFeedback.map((item) => {
              const ratingConfig = RATING_COLORS[item.rating] || RATING_COLORS[5]
              return (
                <Card
                  key={item.feedback_id}
                  className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xs transition hover:border-border hover:shadow-md"
                >
                  <CardContent className="p-5 sm:p-6 space-y-3">
                    {/* CARD HEADER: RATING BADGE, USER & TIME */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* STAR RATING BADGE */}
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold",
                            ratingConfig.bg,
                            ratingConfig.text,
                            ratingConfig.border
                          )}
                        >
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={cn(
                                  "h-3 w-3",
                                  s <= item.rating
                                    ? "fill-current text-current"
                                    : "text-muted-foreground/20 fill-transparent"
                                )}
                              />
                            ))}
                          </div>
                          <span>{item.rating} / 5</span>
                        </div>

                        {/* USER IDENTITY BADGE */}
                        <Badge variant="outline" className="rounded-xl text-[11px] font-medium gap-1 px-2.5 py-0.5">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {item.user_name && item.user_name.trim().length > 0 ? (
                            <span className="text-foreground font-semibold">{item.user_name.trim()}</span>
                          ) : (
                            <span className="text-muted-foreground font-normal">Anonymous</span>
                          )}
                        </Badge>
                      </div>

                      {/* TIMESTAMP & DELETE BUTTON */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                          title={formatExactDate(item.created_at)}
                        >
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(item.created_at)}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItemToDelete(item.feedback_id)}
                          className="h-8 w-8 rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          aria-label="Delete feedback item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* WRITTEN COMMENT MESSAGE */}
                    {item.message && item.message.trim().length > 0 ? (
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 sm:p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">
                        No written comment provided.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl max-w-sm p-6">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="text-lg font-bold">Delete Feedback?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Are you sure you want to permanently delete this feedback entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2 pt-3">
            <AlertDialogCancel className="rounded-xl border-border/80">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
