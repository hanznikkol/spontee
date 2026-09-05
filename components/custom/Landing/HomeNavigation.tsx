"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Plus, MessageSquare, Menu, X, ArrowRight } from "lucide-react"
import { FeedbackDialog } from "@/components/custom/Modal/FeedbackDialog"
import { ThemeToggle, ThemeSegmentedControl } from "@/components/custom/Theme/ThemeToggle"

export function HomeNavigation() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "The Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Live Demo", href: "#demo" },
    { label: "Features", href: "#features" },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-xs"
            : "border-b border-transparent bg-background/40 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* BRAND */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-transform active:scale-95"
            >
              <span className="text-xl font-bold tracking-tight text-foreground">
                Spont
                <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  ee
                </span>
              </span>
            </Link>

            {/* DESKTOP NAV ANCHORS */}
            <nav className="hidden md:flex items-center gap-1 pl-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground hover:bg-muted/50"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedbackOpen(true)}
              className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 text-xs font-medium"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Feedback
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-xl hover:bg-muted/60 text-sm font-medium"
            >
              <Link href="/join">
                <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
                Join Room
              </Link>
            </Button>

            <Button
              size="lg"
              asChild
              className="group rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-md shadow-pink-500/25 transition-all hover:scale-[1.02] hover:shadow-pink-500/40 active:scale-[0.98]"
            >
              <Link href="/create/host">
                Create Room
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-1.5 md:hidden">
            <ThemeToggle />

            <Button
              size="sm"
              asChild
              className="rounded-xl bg-linear-to-r from-pink-500 to-blue-500 px-3 text-xs font-semibold text-white shadow-xs"
            >
              <Link href="/create/host">Create</Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 pt-2 pb-6 md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2 pb-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-3 border-t border-border/40">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">Theme</span>
                <ThemeSegmentedControl className="w-52" />
              </div>
              <Button
                variant="outline"
                asChild
                className="w-full justify-center rounded-xl py-2.5 text-sm font-medium"
              >
                <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  Join Room with Code
                </Link>
              </Button>

              <Button
                asChild
                className="w-full justify-center rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/25"
              >
                <Link href="/create/host" onClick={() => setMobileMenuOpen(false)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create a New Room
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setFeedbackOpen(true)
                }}
                className="w-full justify-center rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Feedback & Suggestions
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* FEEDBACK MODAL */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}