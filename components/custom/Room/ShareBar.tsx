'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

type Props = { url: string }

export function ShareBar({ url }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border bg-muted/40">
      <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
        {url}
      </span>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-70 transition-opacity"
      >
        {copied
          ? <><Check className="w-3 h-3" /> Copied!</>
          : <><LinkIcon className="w-3 h-3" /> Copy</>
        }
      </button>
    </div>
  )
}