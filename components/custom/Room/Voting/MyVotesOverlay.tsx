'use client'

import React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X, Vote as VoteIcon } from 'lucide-react'
import { UserVote } from '@/lib/room/voting/types/vote.types'
import { useMyVotes } from '@/lib/room/voting/hook/useMyVotes'
import { MyVotes } from './MyVotes'
import { cn } from '@/lib/utils'

interface MyVotesOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId?: string
  participantId?: string
  initialVotes?: UserVote[]
  totalOptions?: number
}

export function MyVotesOverlay({
  open,
  onOpenChange,
  roomId,
  participantId,
  initialVotes,
  totalOptions,
}: MyVotesOverlayProps) {
  const {
    votes,
    filteredVotes,
    filter,
    setFilter,
    loading,
    error,
    goCount,
    passCount,
    totalCount,
  } = useMyVotes({
    roomId,
    participantId,
    initialVotes,
    isOpen: open,
  })

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Modal / Bottom Sheet Content */}
        <DialogPrimitive.Content
          aria-describedby="my-votes-description"
          className={cn(
            'fixed z-50 flex flex-col gap-4 bg-card text-card-foreground border border-border/80 shadow-2xl outline-none duration-200',
            // Mobile: Bottom Sheet sliding up
            'bottom-0 inset-x-0 w-full max-h-[85dvh] rounded-t-3xl p-5 pt-3 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-6',
            // Tablet & Desktop: Centered Dialog
            'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:rounded-3xl sm:p-6 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95'
          )}
        >
          {/* Mobile Drag Pill Handle */}
          <div className="sm:hidden flex justify-center py-1">
            <div className="h-1.25 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <VoteIcon className="h-4.5 w-4.5" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  My Votes
                </DialogPrimitive.Title>
                <DialogPrimitive.Description
                  id="my-votes-description"
                  className="text-xs text-muted-foreground"
                >
                  Review your recorded GO & PASS choices
                </DialogPrimitive.Description>
              </div>
            </div>

            {/* Close Button */}
            <DialogPrimitive.Close className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Body Content */}
          <MyVotes
            votes={votes}
            filteredVotes={filteredVotes}
            filter={filter}
            onFilterChange={setFilter}
            goCount={goCount}
            passCount={passCount}
            totalCount={totalCount}
            loading={loading}
            error={error}
            totalOptions={totalOptions}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
