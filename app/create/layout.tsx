export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative overflow-hidden min-h-full">

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

      {children}
    </main>
  )
}