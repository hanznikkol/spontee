"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, SquarePlus, Check, Sparkles } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";

export function IOSInstallDialog() {
  const { isIOS, isIOSDialogOpen, closeIOSDialog } = usePWAInstall();

  if (!isIOS) {
    return null;
  }

  return (
    <Dialog open={isIOSDialogOpen} onOpenChange={(open) => !open && closeIOSDialog()}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <DialogTitle className="text-lg font-bold text-foreground">
              Install Spontee
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Install Spontee on your iPhone or iPad for a faster, full-screen app experience.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 my-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-background border border-border/60 text-foreground shadow-xs text-xs font-semibold">
              1
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground leading-snug pt-0.5">
              Tap the <strong className="font-semibold text-foreground inline-flex items-center gap-1 mx-0.5"><Share className="h-3.5 w-3.5 text-blue-500 inline" /> Share</strong> button in Safari&apos;s toolbar.
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-background border border-border/60 text-foreground shadow-xs text-xs font-semibold">
              2
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground leading-snug pt-0.5">
              Scroll down and tap <strong className="font-semibold text-foreground inline-flex items-center gap-1 mx-0.5"><SquarePlus className="h-3.5 w-3.5 text-foreground inline" /> Add to Home Screen</strong>.
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-background border border-border/60 text-foreground shadow-xs text-xs font-semibold">
              3
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground leading-snug pt-0.5">
              Tap <strong className="font-semibold text-foreground inline-flex items-center gap-1 mx-0.5"><Check className="h-3.5 w-3.5 text-emerald-500 inline" /> Add</strong> in the top-right corner.
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 px-1 leading-normal">
          Spontee will appear on your Home Screen and launch in standalone full-screen mode like a native app.
        </p>

        <DialogFooter className="mt-2 sm:justify-end">
          <Button
            onClick={closeIOSDialog}
            className="w-full sm:w-auto rounded-xl bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:opacity-95"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default IOSInstallDialog;
