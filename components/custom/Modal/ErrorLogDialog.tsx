"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function ErrorDialog({
  open,
  title = "Something went wrong",
  message,
  onClose,
}: ErrorDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[85dvh] flex flex-col rounded-3xl p-5 sm:p-6 border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <AlertDialogHeader className="shrink-0 space-y-2 text-left">
          <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground">{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 my-2">
          <AlertDialogDescription className="whitespace-pre-wrap select-text text-left font-mono text-xs text-muted-foreground rounded-xl bg-muted/40 p-3 border border-border/50">
            {message}
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="shrink-0 pt-2">
          <AlertDialogAction onClick={onClose} className="rounded-xl">
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}