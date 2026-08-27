import { HomeNavigation } from "@/components/custom/Landing/HomeNavigation"
import HeroSection from "@/components/custom/Landing/HeroSection"
import ProblemSection from "@/components/custom/Landing/ProblemSection"
import SolutionSection from "@/components/custom/Landing/SolutionSection"
import InteractiveShowcase from "@/components/custom/Landing/InteractiveShowcase"
import HowItWorksSection from "@/components/custom/Landing/HowItWorksSection"
import FeaturesSection from "@/components/custom/Landing/FeaturesSection"
import FinalCtaSection from "@/components/custom/Landing/FinalCtaSection"
import Footer from "@/components/custom/Landing/Footer"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-background selection:bg-pink-500/20 selection:text-pink-600">
      {/* Background ambient lighting accents */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-120 h-120 bg-pink-500/10 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-125 h-125 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 w-137.5 h-137.5 bg-purple-500/10 rounded-full blur-3xl -z-10" />

      {/* 1. Navigation */}
      <HomeNavigation />

      {/* 2. Hero Section with Swipe & Live Convergence Demonstration */}
      <HeroSection />

      {/* 3. Problem Section: The Group Indecision Dilemma */}
      <ProblemSection />

      {/* 4. Solution Section: The 3 Spontee Principles */}
      <SolutionSection />

      {/* 5. Interactive Spontee Showcase / Sandbox Simulator */}
      <InteractiveShowcase />

      {/* 6. How It Works: 4-Step Flow */}
      <HowItWorksSection />

      {/* 7. Feature Bento Grid: Authentic Spontee Strengths */}
      <FeaturesSection />

      {/* 8. Final Conversion CTA */}
      <FinalCtaSection />

      {/* 9. Footer */}
      <Footer />
    </main>
  )
}
