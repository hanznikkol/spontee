import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {

  const features = [
    {
      title: "Decide Faster",
      desc: "Swipe or vote on options in seconds.",
      emoji: "⚡",
    },
    {
      title: "Choose Anything",
      desc: "From kainan to gala—decide instantly.",
      emoji: "🎯",
    },
    {
      title: "Perfect for Groups",
      desc: "Couples, families, and barkada-friendly decisions.",
      emoji: "👥",
    },
  ]
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">

      <div className=""></div>
      {/* FUN BACKGROUND BLOBS */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 w-120 h-120 bg-purple-400/20 rounded-full blur-3xl" />

      {/* NAV */}
      <header className="relative z-10 border-b bg-background/40 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* BRAND */}
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span>
              Spont<span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 via-purple-500 to-blue-500">ee
              </span>
            </span>
          </h1>
          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            <Button 
              variant="ghost" 
              asChild 
              className="rounded-xl hover:bg-muted/60 transition"
            >
              <Link href="/join">Join Room</Link>
            </Button>

            <Button 
              asChild 
              className="rounded-xl bg-linear-to-r from-pink-500 to-blue-500 text-white shadow-md shadow-pink-500/20 hover:scale-[1.03] transition"
            >
              <Link href="/host">Create Room</Link>
            </Button>

          </div>
        </div>
      </header>
      
      {/* HERO */}
      <section className="relative z-10 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-2xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            ⚡ Swipe. Vote. Decide.
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            No more “where should we go?”
            <span className="bg-linear-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
              {" "}Just Spontee it.
            </span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg">
            For couples, families, and friends who can’t decide where to go, what to eat, or what to do next.
          </p>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Button asChild size="lg" className="w-full rounded-2xl">
              <Link href="/host">🛠️ I’m the host</Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full rounded-2xl">
              <Link href="/join">🔗 I’m a guest</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 container mx-auto px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card
              key={i}
              className="rounded-2xl border bg-background/60 backdrop-blur hover:scale-[1.02] transition"
            >
              <CardContent className="p-6 space-y-2">
                <div className="text-2xl">{f.emoji}</div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t py-6 text-center">
        <p className="mt-2 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Spontee · Developed by{" "}
          <a
            href="https://hanznikkolmaas.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Hanz Nikkol Maas
          </a>
        </p>
      </footer>
    </main>
  )
}
