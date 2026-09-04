"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, ArrowUpRight } from "lucide-react"
import { FeedbackDialog } from "@/components/custom/Modal/FeedbackDialog"

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <>
      <footer className="relative z-10 border-t border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-12 items-center justify-between">
            {/* BRAND COLUMN */}
            <div className="md:col-span-12 lg:col-span-5 space-y-3">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">
                  Spont
                  <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    ee
                  </span>
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                The real-time group decision-making app. Stop debating &ldquo;where should we
                go?&rdquo; and let individual votes converge into one group recommendation.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div className="md:col-span-7 lg:col-span-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              <a href="#problem" className="hover:text-foreground transition">
                The Problem
              </a>
              <a href="#how-it-works" className="hover:text-foreground transition">
                How It Works
              </a>
              <a href="#demo" className="hover:text-foreground transition">
                Interactive Demo
              </a>
              <a href="#features" className="hover:text-foreground transition">
                Features
              </a>
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="hover:text-foreground transition flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 text-pink-500" />
                Feedback
              </button>
            </div>

            {/* ACTION SHORTCUTS */}
            <div className="md:col-span-5 lg:col-span-3 flex items-center md:justify-end gap-2 flex-wrap">
              <Link
                href="/join"
                className="rounded-xl border border-border/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                Join Room
              </Link>
              <Link
                href="/create/host"
                className="rounded-xl bg-linear-to-r from-pink-500 to-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition"
              >
                Create Room
              </Link>
            </div>
          </div>

          {/* DEVELOPER ATTRIBUTION — PRESERVED AS REQUIRED */}
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} Spontee · Developed by{" "}
              <a
                href="https://hanznikkolmaas.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline inline-flex items-center gap-0.5"
              >
                Hanz Nikkol Maas
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </a>
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Ano Tara? Decide faster, together.
            </p>
          </div>
        </div>
      </footer>

      {/* FEEDBACK MODAL */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}