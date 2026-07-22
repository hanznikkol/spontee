"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { Camera, Upload,} from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"

interface QRScannerCardProps {
  uploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onUpload: React.ChangeEventHandler<HTMLInputElement>
  onScan: (value:string) => void
}

export default function QRScannerCard({ uploading, fileInputRef, onUpload, onScan}: QRScannerCardProps) {
  return (
    <Card className="rounded-3xl border-dashed">
      <CardContent className="p-6">

        <Tabs defaultValue="camera" className="space-y-6">

          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">
              Scan QR Code
            </h2>

            <p className="text-sm text-muted-foreground">
              Choose how you&apos;d like to scan the host&apos;s QR code.
            </p>
          </div>

          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </TabsTrigger>

            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          {/* CAMERA */}
          <TabsContent value="camera">
            <div className="overflow-hidden rounded-2xl border">
                <Scanner constraints={{ facingMode: "environment",}}
                    onScan={(results) => {
                        if (!results.length) return

                        onScan(results[0].rawValue)
                    }}
                    onError={(error) => { console.error(error)}}
                    styles={{ container: { width: "100%", height: 320, }, }}
                />
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
                Point your camera at the host&apos;s QR code.
            </p>
            </TabsContent>

          {/* UPLOAD */}
          <TabsContent value="upload">

            <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center space-y-4">

              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  Upload QR Image
                </p>

                <p className="text-sm text-muted-foreground">
                  PNG, JPG and HEIC are supported.
                </p>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading
                  ? "Reading..."
                  : "Choose Image"}
              </Button>

            </div>

          </TabsContent>

        </Tabs>

      </CardContent>
    </Card>
  )
}