import { Check, Copy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Card, CardContent } from '@/components/ui/card'

interface InviteCardProps {
  shareCode: string
  shareUrl: string
  copiedKey: string | null
  onCopy: (value: string, key: string) => void
}

export default function InviteCard({ shareCode, shareUrl, copiedKey, onCopy, }: InviteCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-sm">

        <div className="absolute inset-0 bg-linear-to-br from-pink-400/30 via-fuchsia-400/20 to-blue-400/30 blur-3xl scale-110 rounded-[3rem]" />

        <div className="absolute -inset-px rounded-[2rem] bg-linear-to-br from-pink-400/40 via-transparent to-blue-400/40 opacity-70" />

        <Card className="relative rounded-[2rem] border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center gap-6">

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">
                Invite Others
              </h2>

              <p className="text-sm text-muted-foreground">
                Share code or scan QR to join
              </p>
            </div>

            {/* Room Code */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Room Code
              </p>

              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border bg-background/70">
                <span className="text-lg md:text-xl font-mono font-bold tracking-[0.3em]">
                  {shareCode}
                </span>

                <div className="w-px h-6 bg-border" />

                <button
                  onClick={() => onCopy(shareCode, 'code')}
                  className="text-xs font-medium text-primary flex items-center gap-1"
                >
                  {copiedKey === 'code' ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR */}
            <div className="relative">
              <div className="relative p-4 bg-white rounded-[1.5rem] shadow-xl">
                <QRCodeSVG
                  value={shareUrl}
                  size={190}
                  level="H"
                />
              </div>
            </div>

            {/* Link */}
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground">
                Direct Link
              </p>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border">
                <span className="text-xs truncate flex-1 font-mono">
                  {shareUrl || 'Loading...'}
                </span>

                <button
                  onClick={() => onCopy(shareUrl, 'link')}
                  className="shrink-0 text-xs font-medium text-primary"
                >
                  {copiedKey === 'link' ? (
                    <>
                      <Check className="w-3 h-3 inline mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 inline mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}