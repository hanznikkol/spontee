"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  CalendarPlus,
  Share2,
  Check,
  MapPin,
  Sparkles,
} from "lucide-react"
import { RoomOption } from "@/lib/room/create/types/option-types"
import { Participants } from "@/lib/room/lobby/types/participants-types"
import { cn } from "@/lib/utils"

interface ResultPlanModalProps {
  isOpen: boolean
  onClose: () => void
  option: RoomOption
  participants: Participants[]
  roomCode: string
}

function getInitialDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getInitialTime(): string {
  const now = new Date()
  const currentHour = now.getHours()
  if (currentHour < 12) return "12:30"
  if (currentHour < 18) return "19:00"
  return "20:30"
}

export function ResultPlanModal({
  isOpen,
  onClose,
  option,
  participants,
  roomCode,
}: ResultPlanModalProps) {
  const [date, setDate] = useState<string>(getInitialDate)
  const [time, setTime] = useState<string>(getInitialTime)
  const [deselectedNames, setDeselectedNames] = useState<string[]>([])
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Pure derived selected participants: all participants except those explicitly deselected
  const selectedParticipants = useMemo(() => {
    return participants
      .filter((p) => !deselectedNames.includes(p.display_name))
      .map((p) => p.display_name)
  }, [participants, deselectedNames])

  const toggleParticipant = (name: string) => {
    setDeselectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const toggleAllParticipants = () => {
    if (selectedParticipants.length === participants.length) {
      setDeselectedNames(participants.map((p) => p.display_name))
    } else {
      setDeselectedNames([])
    }
  }

  // Quick Date presets
  const handleDatePreset = (daysOffset: number) => {
    const target = new Date()
    target.setDate(target.getDate() + daysOffset)
    const year = target.getFullYear()
    const month = String(target.getMonth() + 1).padStart(2, "0")
    const day = String(target.getDate()).padStart(2, "0")
    setDate(`${year}-${month}-${day}`)
  }

  // Quick Time presets
  const handleTimePreset = (presetTime: string) => {
    setTime(presetTime)
  }

  // Generate Google Calendar Link
  const handleAddToCalendar = () => {
    try {
      const startDateTime = new Date(`${date}T${time}:00`)
      const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)

      const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "")
      const datesParam = `${formatGCalDate(startDateTime)}/${formatGCalDate(endDateTime)}`

      const eventTitle = `Hangout @ ${option.title}`
      const attendeesText =
        selectedParticipants.length > 0 ? selectedParticipants.join(", ") : "The group"
      const eventDetails = `Decided on Spontee!\n\n📍 Place: ${option.title}\n🗺️ Address: ${option.address || "N/A"}\n👥 People going: ${attendeesText}\n🔗 Room Code: ${roomCode}`
      const eventLocation = option.address ? `${option.title}, ${option.address}` : option.title

      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: eventTitle,
        dates: datesParam,
        details: eventDetails,
        location: eventLocation,
      })

      const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`
      window.open(calendarUrl, "_blank", "noopener,noreferrer")
    } catch {
      window.open("https://calendar.google.com", "_blank", "noopener,noreferrer")
    }
  }

  // Generate and Share / Copy Plan Invite Text
  const getPlanInviteText = () => {
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${option.title} ${option.address || ""}`)}`

    let formattedDateString = date
    let formattedTimeString = time
    try {
      const d = new Date(`${date}T${time}:00`)
      formattedDateString = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      formattedTimeString = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      // Fallback to raw string
    }

    const attendees =
      selectedParticipants.length > 0 ? selectedParticipants.join(", ") : "Everyone"

    return `🎉 Dito tayo: ${option.title}\n📅 When: ${formattedDateString} at ${formattedTimeString}\n👥 People going: ${attendees}\n🗺️ Directions: ${directionsUrl}\n✨ Decided on Spontee (${roomCode})`
  }

  const handleSharePlan = async () => {
    const inviteText = getPlanInviteText()

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Hangout @ ${option.title}`,
          text: inviteText,
        })
        return
      } catch {
        // Fallback to clipboard if share was cancelled or unsupported
      }
    }

    await navigator.clipboard.writeText(inviteText)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg max-h-[90dvh] flex flex-col p-4 sm:p-6 rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl overflow-y-auto">
        <DialogHeader className="space-y-1 text-left pb-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Plan this Hangout
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pick a time, see who&apos;s going, and share the plan with your group.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* VENUE RECAP */}
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 sm:p-3.5 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Selected Venue
            </span>
            <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
              {option.title}
            </p>
            {option.address && (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground line-clamp-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-500 mt-0.5" />
                <span>{option.address}</span>
              </p>
            )}
          </div>

          {/* DATE PICKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="plan-date" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-purple-500" />
                Date
              </label>
              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDatePreset(0)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset(1)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset(2)}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  +2 Days
                </button>
              </div>
            </div>
            <Input
              id="plan-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-xl bg-background/50 text-xs sm:text-sm font-medium border-border/80 focus-visible:ring-purple-500/20"
            />
          </div>

          {/* TIME PICKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="plan-time" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                Time
              </label>
              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleTimePreset("12:00")}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  Lunch
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset("19:00")}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  Dinner
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePreset("21:00")}
                  className="px-2 py-0.5 text-[11px] rounded-lg bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  Late
                </button>
              </div>
            </div>
            <Input
              id="plan-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 rounded-xl bg-background/50 text-xs sm:text-sm font-medium border-border/80 focus-visible:ring-blue-500/20"
            />
          </div>

          {/* PEOPLE GOING */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-pink-500" />
                People going
                <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 rounded-md font-mono">
                  {selectedParticipants.length}/{participants.length || selectedParticipants.length}
                </Badge>
              </span>
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAllParticipants}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer font-medium"
                >
                  {selectedParticipants.length === participants.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {participants.length > 0 ? (
                participants.map((p) => {
                  const isSelected = selectedParticipants.includes(p.display_name)
                  return (
                    <button
                      key={p.participant_id}
                      type="button"
                      onClick={() => toggleParticipant(p.display_name)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-foreground shadow-2xs font-semibold"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isSelected ? <Check className="h-2.5 w-2.5" /> : p.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span>{p.display_name}</span>
                      {p.is_host && <span className="text-[9px] text-muted-foreground font-normal">(Host)</span>}
                    </button>
                  )
                })
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Room participants will appear here automatically.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* OUTPUT ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-4 mt-1 border-t border-border/50">
          <Button
            type="button"
            onClick={handleAddToCalendar}
            variant="outline"
            className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold border-border/80 hover:bg-muted transition active:scale-[0.98]"
          >
            <CalendarPlus className="mr-2 h-4 w-4 text-purple-500" />
            <span>Add to Google Calendar</span>
          </Button>

          <Button
            type="button"
            onClick={handleSharePlan}
            className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-md shadow-pink-500/15 hover:opacity-95 transition active:scale-[0.98]"
          >
            {copiedInvite ? (
              <>
                <Check className="mr-2 h-4 w-4 text-white" />
                <span>Plan Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4 text-white" />
                <span>Share Plan</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
