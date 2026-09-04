"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLobby } from "@/lib/room/lobby/hook/useLobby"
import { useClipboard } from "@/lib/room/lobby/hook/useClipboard"
import LobbyHeader from "@/components/custom/RoomLobby/LobbyHeader"
import ParticipantList from "@/components/custom/RoomLobby/ParticipantList"
import LobbyActions from "@/components/custom/RoomLobby/LobbyActions"
import InviteCard from "@/components/custom/RoomLobby/InviteCard"
import { LobbyPreferencesCard } from "@/components/custom/RoomLobby/LobbyPreferencesCard"
import { UpdatePreferencesModal } from "@/components/custom/RoomPreferences/UpdatePreferencesModal"
import { PreferenceBudget } from "@/lib/room/create/types/budget"

export default function LobbyPage() {
  const {
    loading,
    room,
    participants,
    preferences,
    currentParticipant,
    shareCode,
    shareUrl,
    handleOpenRoom,
    handleStartVoting,
    handleRenameParticipant,
    handleLeaveRoom,
    handleKickParticipant,
    reloadPreferences,
  } = useLobby()
  const { copiedKey, handleCopy } = useClipboard()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const participantCount = participants.length
  const maxParticipants = room?.max_participants ?? 0
  const isHost = currentParticipant?.is_host ?? false
  const isLobby = room?.status === "lobby"
  const isActive = room?.status === "active"

  const canOpenRoom = isHost && isLobby && participantCount >= 2
  const isRoomFull = maxParticipants > 0 && participantCount >= maxParticipants

  return (
    <main className="min-h-dvh w-full bg-background relative overflow-x-hidden px-3.5 sm:px-6 md:px-8 py-6 sm:py-10 flex flex-col justify-between">
      {/* AMBIENT BACKGROUND GLOW BLOBS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10">
        <div className="absolute -top-40 -left-40 h-120 w-120 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-120 w-120 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-120 w-120 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* SPONTEE BRAND HEADER */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 transition-transform active:scale-95"
          >
            <span className="text-xl font-bold tracking-tight text-foreground">
              Spont
              <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ee
              </span>
            </span>
          </Link>
        </div>

        {/* RESPONSIVE LOBBY GRID */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start"
        >
          {/* LEFT COLUMN: ROOM INFO, PREFERENCES & INVITE CARD */}
          <div className="md:col-span-5 flex flex-col gap-4 sm:gap-5">
            <LobbyHeader
              roomName={room?.room_name}
              isActive={isActive}
              isHost={isHost}
              onLeaveRoom={handleLeaveRoom}
            />

            <LobbyPreferencesCard
              preferences={preferences}
              maxOptions={room?.max_options ?? 10}
              isHost={isHost}
              isLobby={isLobby}
              onEditPreferences={() => setIsEditModalOpen(true)}
            />

            <InviteCard
              shareCode={shareCode}
              shareUrl={shareUrl}
              copiedKey={copiedKey}
              onCopy={handleCopy}
            />
          </div>

          {/* RIGHT COLUMN: PARTICIPANTS & PRIMARY ACTION */}
          <div className="md:col-span-7 flex flex-col gap-4 sm:gap-5">
            <ParticipantList
              participants={participants}
              currentParticipant={currentParticipant}
              participantCount={participantCount}
              maxParticipants={maxParticipants}
              isRoomFull={isRoomFull}
              isHost={isHost}
              onRenameParticipant={handleRenameParticipant}
              onKickParticipant={handleKickParticipant}
            />

            <LobbyActions
              isHost={isHost}
              isLobby={isLobby}
              isActive={isActive}
              participantCount={participantCount}
              canOpenRoom={canOpenRoom}
              loading={loading}
              onOpenRoom={handleOpenRoom}
              onStartVoting={handleStartVoting}
            />
          </div>
        </motion.div>
      </div>

      {/* HOST-ONLY UPDATE PREFERENCES MODAL */}
      {room && (
        <UpdatePreferencesModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          roomId={room.room_id}
          source="lobby"
          initialPreferences={{
            categoryNames: preferences?.categoryNames,
            budget: (preferences?.budget as PreferenceBudget) ?? "any",
            latitude: preferences?.latitude,
            longitude: preferences?.longitude,
            address: preferences?.address,
            radius: preferences?.radius,
            maxOptions: room.max_options,
          }}
          onSuccess={reloadPreferences}
        />
      )}
    </main>
  )
}