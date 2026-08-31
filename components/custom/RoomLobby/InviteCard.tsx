"use client"

import React from "react"
import { Check, Copy, QrCode, Link2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface InviteCardProps {
  shareCode: string
  shareUrl: string
  copiedKey: string | null
  onCopy: (value: string, key: string) => void
}

export default function InviteCard({
  shareCode,
  shareUrl,
  copiedKey,
  onCopy,
}: InviteCardProps) {
  const isCodeCopied = copiedKey === "code"
  const isLinkCopied = copiedKey === "link"

  return (
    <Card className="w-full rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-xl overflow-hidden transition-all">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <QrCode className="h-4 w-4 text-pink-500" />
              Invite Friends
            </h2>
            <p className="text-xs text-muted-foreground">
              Share code or scan QR code to join
            </p>
          </div>
        </div>

        {/* ROOM CODE DISPLAY */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Room Code</span>
            <span>Tap to copy</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl border border-border/80 bg-background/60">
            <span className="font-mono text-base sm:text-lg font-bold tracking-[0.2em] text-foreground select-all pl-1 sm:pl-2">
              {shareCode || "..."}
            </span>

            <Button
              type="button"
              variant={isCodeCopied ? "default" : "outline"}
              size="sm"
              onClick={() => onCopy(shareCode, "code")}
              className={`h-8 rounded-xl px-3 text-xs font-semibold gap-1.5 transition-all ${
                isCodeCopied
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
                  : "border-border/80 hover:bg-muted/80"
              }`}
            >
              {isCodeCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* QR CODE CONTAINER */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="p-3 sm:p-3.5 bg-white rounded-2xl shadow-md border border-black/5 inline-flex items-center justify-center transition-transform hover:scale-[1.02]">
            {shareUrl ? (
              <QRCodeSVG
                value={shareUrl}
                size={160}
                level="H"
                className="w-36 h-36 sm:w-40 sm:h-40"
              />
            ) : (
              <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center bg-gray-50 rounded-xl text-xs text-gray-400">
                Generating QR...
              </div>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground mt-2">
            Scan with phone camera to join
          </span>
        </div>

        {/* DIRECT LINK INPUT */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Direct Link
          </span>

          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-muted/40 border border-border/70">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground truncate flex-1 select-all">
              {shareUrl || "Loading link..."}
            </span>

            <Button
              type="button"
              variant={isLinkCopied ? "default" : "secondary"}
              size="sm"
              onClick={() => onCopy(shareUrl, "link")}
              className={`h-8 shrink-0 rounded-xl px-3 text-xs font-semibold transition-all ${
                isLinkCopied
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : ""
              }`}
            >
              {isLinkCopied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}