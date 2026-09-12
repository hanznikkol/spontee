"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { loginAdminAction } from "@/lib/feedback/actions/admin-auth.actions"

export function AdminLoginCard() {
  const router = useRouter()
  const [passcode, setPasscode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await loginAdminAction(passcode.trim())
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || "Invalid admin passcode.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* HEADER ICON & TITLE */}
          <div className="text-center space-y-2.5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 ring-1 ring-pink-500/20 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Spontee Admin Portal
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your admin secret key to view and manage user feedback.
              </p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-passcode" className="text-xs font-medium text-muted-foreground">
                Admin Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="admin-passcode"
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret passcode..."
                  className="pl-10 pr-10 h-12 rounded-2xl border-input bg-background/50 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                  aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive px-3.5 py-2.5 text-xs flex items-start gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full h-12 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold text-sm shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Unlock Dashboard"
              )}
            </Button>
          </form>

          {/* BACK TO HOME */}
          <div className="pt-2 text-center border-t border-border/40">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Spontee Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
