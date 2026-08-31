import { CreateBackground } from "@/components/custom/RoomCreation/CreateBackground"

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-background">
      <CreateBackground />
      {children}
    </main>
  )
}