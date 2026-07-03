import { Card, CardContent } from '@/components/ui/card'
import { features } from '@/lib/landing/text-metadata'

function FeaturesSection() {
  return (
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
  )
}

export default FeaturesSection