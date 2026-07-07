import { HomeNavigation } from '@/components/custom/Landing/HomeNavigation'
import HeroSection from "@/components/custom/Landing/HeroSection"
import FeaturesSection from "@/components/custom/Landing/FeaturesSection"
import Footer from "@/components/custom/Landing/Footer"
export default function HomePage() {

  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-40 w-md h-112 bg-blue-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 w-120 h-120 bg-purple-400/20 rounded-full blur-3xl" />

      {/* Blobs */}

      {/* Navigation */}
      <HomeNavigation />
      {/* Content */}
      <HeroSection/>
      <FeaturesSection/>
      {/* Footer */}
      <Footer/>
    </main>
  )
}
