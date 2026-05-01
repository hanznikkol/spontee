'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Option } from '@/lib/options/option-types'

type ResultScreenProps = {
  winner: Option | null
  mode: 'couple' | 'group' | null
  shareUrl: string
  onRestart: () => void
}

export default function ResultScreen({ winner, mode, shareUrl, onRestart }: ResultScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center px-4 gap-5 bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-sm flex flex-col items-center gap-4 text-center"
      >
        <p className="text-5xl">🎉</p>

        <p className="text-xl font-semibold text-muted-foreground">
          {mode === 'couple' ? 'You both decided...' : 'The group decided...'}
        </p>

        <Card className="w-full rounded-3xl">
          <CardContent className="py-8 px-10 flex flex-col items-center gap-2">
            <p className="text-4xl font-bold">{winner?.text ?? '—'}</p>
            {winner && winner.votes > 0 && (
              <p className="text-sm text-muted-foreground">
                {winner.votes} vote{winner.votes !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="outline"
            className="w-full rounded-2xl gap-2"
            onClick={handleCopy}
          >
            {copied
              ? <><Check className="w-4 h-4" /> Copied!</>
              : <><Copy className="w-4 h-4" /> Share Result</>
            }
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-2xl"
            onClick={onRestart}
          >
            🔄 Start Over
          </Button>
        </div>
      </motion.div>
    </main>
  )
}