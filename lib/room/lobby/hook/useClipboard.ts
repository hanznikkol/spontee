"use client"

import { useState } from "react"

export function useClipboard() {
  const [copiedKey, setCopiedKey] =
    useState<string | null>(null)

  async function handleCopy( text: string, key: string ) {
    try {
      await navigator.clipboard.writeText(text)

      setCopiedKey(key)

      setTimeout(() => {
        setCopiedKey(null)
      }, 3000)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    copiedKey,
    handleCopy,
  }
}