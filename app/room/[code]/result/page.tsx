"use client"

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { ResultType } from '@/lib/room/result/result.types'
import { RoomOption } from '@/lib/room/create/types/option-types'

import ResultHeader from '@/components/custom/RoomResult/ResultHeader'
import ResultRecommendationCard from '@/components/custom/RoomResult/ResultRecommendationCard'
import ResultDetailsGrid from '@/components/custom/RoomResult/ResultDetailsGrid'
import ResultActions from '@/components/custom/RoomResult/ResultActions'
import ResultNoMatchCard from '@/components/custom/RoomResult/ResultNoMatchCard'

// Mock Data
const MOCK_PARTICIPANT_COUNT = 4
const MOCK_TOTAL_OPTIONS = 12

const MOCK_OPTION: RoomOption = {
  option_id: 'opt_123',
  title: 'The Rustic Spoon',
  category: 'restaurant' as unknown as RoomOption['category'],
  rating: 4.8,
  totalReviews: 1240,
  priceLevel: 2,
  address: '123 Culinary Ave, Food District, Cityville',
  imageUrls: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
  ],
}

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

export default function ResultPage() {
  const params = useParams()
  const code = (params?.code as string) || 'DEMO'

  const [resultType, setResultType] = useState<ResultType>('consensus')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate brief load for reveal
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

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

  return (
    <div className="min-h-dvh bg-background relative overflow-x-hidden flex flex-col justify-start py-5 px-3.5 sm:px-6 sm:py-8 md:py-12">
      {/* Subtle Ambient Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-200 h-90 opacity-35 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-pink-500/20 via-purple-500/10 to-transparent blur-[80px] rounded-full mix-blend-screen dark:opacity-45" />
      </div>

      <motion.div
        className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-8 z-10 pb-16 sm:pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {resultType === 'no_match' ? (
          <motion.div variants={itemVariants} className="w-full">
            <ResultNoMatchCard />
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="w-full">
              <ResultHeader
                type={resultType}
                participantCount={MOCK_PARTICIPANT_COUNT}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <ResultRecommendationCard
                option={MOCK_OPTION}
                type={resultType}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <ResultDetailsGrid
                option={MOCK_OPTION}
                roomCode={code}
                participantCount={MOCK_PARTICIPANT_COUNT}
                totalOptions={MOCK_TOTAL_OPTIONS}
                type={resultType}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full pt-1 sm:pt-2">
              <ResultActions option={MOCK_OPTION} />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Dev Toggle (Subtle floating pills for previewing states) */}
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1 bg-background/90 backdrop-blur-md px-2 py-1.5 rounded-full border shadow-md">
        <span className="text-[10px] text-muted-foreground font-semibold px-1 hidden xs:inline">
          Demo:
        </span>
        <button
          type="button"
          onClick={() => setResultType('consensus')}
          className={`text-[11px] px-2 py-1 rounded-full font-medium transition-colors ${
            resultType === 'consensus'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Consensus
        </button>
        <button
          type="button"
          onClick={() => setResultType('compromise')}
          className={`text-[11px] px-2 py-1 rounded-full font-medium transition-colors ${
            resultType === 'compromise'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Compromise
        </button>
        <button
          type="button"
          onClick={() => setResultType('no_match')}
          className={`text-[11px] px-2 py-1 rounded-full font-medium transition-colors ${
            resultType === 'no_match'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          No Match
        </button>
      </div>
    </div>
  )
}