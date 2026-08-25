'use client'
import { motion } from 'framer-motion'
import { useLobby } from '@/lib/room/lobby/hook/useLobby'
import { useClipboard } from '@/lib/room/lobby/hook/useClipboard'
import LobbyHeader from '@/components/custom/RoomLobby/LobbyHeader'
import ParticipantList from '@/components/custom/RoomLobby/ParticipantList'
import LobbyActions from '@/components/custom/RoomLobby/LobbyActions'
import InviteCard from '@/components/custom/RoomLobby/InviteCard'

export default function LobbyPage() {
  const { loading, room, participants, currentParticipant, shareCode, shareUrl, handleOpenRoom, handleStartVoting } = useLobby()
  const { copiedKey, handleCopy, } = useClipboard()

  const participantCount = participants.length
  const maxParticipants = room?.max_participants ?? 0
  const isHost = currentParticipant?.is_host ?? false
  const isLobby = room?.status === "lobby"
  const isActive = room?.status === "active"
  
  const canOpenRoom = isHost && isLobby && participantCount >= 2
  const isRoomFull = maxParticipants > 0 && participantCount >= maxParticipants

   return (
    <main className="min-h-dvh w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">

      {/* Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">

        {/* LEFT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4">
          <LobbyHeader
            roomName={room?.room_name}
            isActive={isActive}
          />

          <ParticipantList
            participants={participants}
            currentParticipant={currentParticipant}
            participantCount={participantCount}
            maxParticipants={maxParticipants}
            isRoomFull={isRoomFull}
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
        </motion.div>

        {/* DIVIDER */}
        <div className="hidden md:flex items-center">
          <div className="w-px h-full bg-border" />
        </div>

        {/* RIGHT */}
        <InviteCard
          shareCode={shareCode}
          shareUrl={shareUrl}
          copiedKey={copiedKey}
          onCopy={handleCopy}
        />

      </div>
    </main>
  )
}