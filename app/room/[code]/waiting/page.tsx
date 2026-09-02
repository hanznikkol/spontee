'use client'
import { motion } from 'framer-motion'
import LogoBranding from '@/components/custom/Landing/LogoBranding'
import WaitingHeader from '@/components/custom/RoomWaiting/WaitingHeader'
import WaitingHeroCard from '@/components/custom/RoomWaiting/WaitingHeroCard'
import WaitingProgressCard from '@/components/custom/RoomWaiting/WaitingProgressCard'
import { useWaiting } from '@/lib/room/waiting/hooks/useWaiting'

export default function WaitingPage() {
 const { code, room, participants, currentParticipant, finishedCount, totalParticipants, progressPercent, isAllFinished } = useWaiting()
  return (
    <>
      <LogoBranding />
      <main className="min-h-dvh w-full flex items-center justify-center p-4 pt-14 md:pt-6 pb-8 sm:pb-12 bg-background relative overflow-x-hidden">
        {/* Background ambient orbs matching Lobby */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl flex flex-col gap-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <WaitingHeader
              roomName={room?.room_name}
              roomCode={code}
              isAllFinished={isAllFinished}
            />
          </motion.div>

          {/* Main 2-Column Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-6 items-stretch"
          >
            {/* LEFT: You're All Set & Reassurance Hub */}
            <WaitingHeroCard
              isAllFinished={isAllFinished}
              roomId={room?.room_id}
              participantId={currentParticipant?.participant_id}
            />

            {/* DIVIDER (Desktop) */}
            <div className="hidden md:flex items-center">
              <div className="w-px h-full bg-border" />
            </div>

            {/* RIGHT: Live Group Progress & Participants */}
            <WaitingProgressCard
              participants={participants}
              currentParticipant={currentParticipant}
              finishedCount={finishedCount}
              totalParticipants={totalParticipants}
              progressPercent={progressPercent}
              isAllFinished={isAllFinished}
            />
          </motion.div>
        </div>
      </main>
    </>
  )
}