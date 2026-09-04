"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { useResult } from '@/lib/room/result/hooks/useResult'
import { OptionVoteTally } from '@/lib/room/result/result.types'

import { Button } from '@/components/ui/button'
import ResultHeader from '@/components/custom/RoomResult/ResultHeader'
import ResultRecommendationCard from '@/components/custom/RoomResult/ResultRecommendationCard'
import ResultPreferenceSummary from '@/components/custom/RoomResult/ResultPreferenceSummary'
import ResultVoteBreakdown from '@/components/custom/RoomResult/ResultVoteBreakdown'
import ResultBreakdownModal from '@/components/custom/RoomResult/ResultBreakdownModal'
import ResultDetailsGrid from '@/components/custom/RoomResult/ResultDetailsGrid'
import ResultActions from '@/components/custom/RoomResult/ResultActions'
import ResultNoMatchCard from '@/components/custom/RoomResult/ResultNoMatchCard'

// Container reveal animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
  },
}

import { useRouter } from 'next/navigation'
import { UpdatePreferencesModal } from '@/components/custom/RoomPreferences/UpdatePreferencesModal'
import { PreferenceBudget } from '@/lib/room/create/types/budget'

export default function ResultPage() {
  const router = useRouter()
  const {
    code,
    roomId,
    room,
    isHost,
    resultType,
    option,
    preferences,
    explanation,
    participantCount,
    totalOptions,
    winnerGoCount,
    tally,
    isLoading,
    error,
  } = useResult()

  // Sheet / Modal Progressive Disclosure State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'list' | 'detail'>('list')
  const [selectedAlternative, setSelectedAlternative] = useState<OptionVoteTally | null>(null)
  const [isChangePrefOpen, setIsChangePrefOpen] = useState(false)

  const handleSelectAlternative = (item: OptionVoteTally) => {
    setSelectedAlternative(item)
    setModalMode('detail')
    setIsModalOpen(true)
  }

  const handleOpenFullBreakdown = () => {
    setSelectedAlternative(null)
    setModalMode('list')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs sm:text-sm text-muted-foreground font-medium animate-pulse">
            Calculating results...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Unable to Load Results
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error}
            </p>
          </div>
          <Button asChild className="w-full mt-2">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-background relative overflow-x-hidden flex flex-col justify-start py-5 px-3.5 sm:px-6 sm:py-8 md:py-12">
      {/* Subtle Ambient Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-200 h-90 opacity-35 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-pink-500/20 via-purple-500/10 to-transparent blur-[80px] rounded-full mix-blend-screen dark:opacity-45" />
      </div>

      <motion.div
        className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-7 z-10 pb-16 sm:pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {!resultType || resultType === 'no_match' || resultType === 'retry' || !option ? (
          <motion.div variants={itemVariants} className="w-full">
            <ResultNoMatchCard
              roomId={roomId}
              roomCode={code}
              isHost={isHost}
              participantCount={participantCount}
              onOpenChangePreferences={() => setIsChangePrefOpen(true)}
            />
          </motion.div>
        ) : (
          <>
            {/* 1. Result Header */}
            <motion.div variants={itemVariants} className="w-full">
              <ResultHeader
                type={resultType}
                participantCount={participantCount}
              />
            </motion.div>

            {/* 2. Primary Recommendation Hero, Explanation & Contextual Preferences */}
            <motion.div variants={itemVariants} className="w-full flex flex-col gap-3">
              <ResultRecommendationCard
                option={option}
                type={resultType}
              />
              {(preferences || explanation) && (
                <ResultPreferenceSummary
                  preferences={preferences ?? {}}
                  explanation={explanation}
                />
              )}
            </motion.div>

            {/* 3. Group Vote Breakdown & Top 2 Alternatives */}
            <motion.div variants={itemVariants} className="w-full">
              <ResultVoteBreakdown
                tally={tally}
                resultType={resultType}
                participantCount={participantCount}
                winnerGoCount={winnerGoCount}
                onSelectAlternative={handleSelectAlternative}
                onOpenFullBreakdown={handleOpenFullBreakdown}
              />
            </motion.div>

            {/* 4. Streamlined Session Stats & Location */}
            <motion.div variants={itemVariants} className="w-full">
              <ResultDetailsGrid
                option={option}
                roomCode={code}
                participantCount={participantCount}
                totalOptions={totalOptions}
              />
            </motion.div>

            {/* 5. Primary Action Path */}
            <motion.div variants={itemVariants} className="w-full pt-1 sm:pt-2">
              <ResultActions option={option} />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Progressive Disclosure Modal / Bottom Sheet */}
      {resultType && resultType !== 'no_match' && (
        <ResultBreakdownModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          tally={tally}
          resultType={resultType}
          participantCount={participantCount}
          winnerGoCount={winnerGoCount}
          initialSelectedOption={selectedAlternative}
          initialMode={modalMode}
        />
      )}

      {/* Host-Only Update Preferences Modal */}
      {roomId && (
        <UpdatePreferencesModal
          open={isChangePrefOpen}
          onOpenChange={setIsChangePrefOpen}
          roomId={roomId}
          source="result"
          initialPreferences={{
            categoryNames: preferences?.categoryNames,
            budget: (preferences?.budget as PreferenceBudget) ?? "any",
            latitude: preferences?.latitude,
            longitude: preferences?.longitude,
            address: preferences?.address,
            radius: preferences?.radius,
            maxOptions: room?.max_options ?? 10,
          }}
          onSuccess={() => {
            if (code) {
              router.push(`/room/${code}`)
            }
          }}
        />
      )}
    </div>
  )
}