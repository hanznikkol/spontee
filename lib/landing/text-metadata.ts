export interface DemoOption {
  id: string
  title: string
  category: string
  rating: number
  reviewsCount: number
  address: string
  priceLevel: number
  image: string
  tag: string
  highlight: string
}

export interface StepItem {
  number: string
  title: string
  tagline: string
  description: string
  highlight: string
  badge: string
}

export interface FeatureItem {
  id: string
  title: string
  description: string
  badge: string
  iconName: string
  gradient: string
  colSpan?: string
}

export const DEMO_OPTIONS: DemoOption[] = [
  {
    id: "demo-1",
    title: "Mendokoro Ramenba",
    category: "Japanese Ramen",
    rating: 4.9,
    reviewsCount: 1420,
    address: "BGC, Taguig City",
    priceLevel: 3,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop",
    tag: "Crowd Favorite",
    highlight: "Rich tonkotsu broth & artisanal handmade noodles",
  },
  {
    id: "demo-2",
    title: "Wildflour Cafe + Bakery",
    category: "Brunch & Bistro",
    rating: 4.8,
    reviewsCount: 2310,
    address: "Net Park, 5th Ave, BGC",
    priceLevel: 3,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop",
    tag: "Cozy Vibe",
    highlight: "Famous cronuts, truffle scramble & specialty coffee",
  },
  {
    id: "demo-3",
    title: "Sweet Ecstasy",
    category: "Burgers & Shakes",
    rating: 4.7,
    reviewsCount: 980,
    address: "Jupiter St, Makati City",
    priceLevel: 2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    tag: "Quick Bite",
    highlight: "Smash-style double cheeseburgers & adult milkshakes",
  },
]

export const PROBLEM_QUOTES = [
  {
    author: "Maya",
    time: "12:02 PM",
    text: "Saan tayo kakain guys? Gutom na me",
    isHost: true,
  },
  {
    author: "Liam",
    time: "12:03 PM",
    text: "Kahit saan, kayo bahala 😂",
    isHost: false,
  },
  {
    author: "Chloe",
    time: "12:04 PM",
    text: "Wag lang fast food, nag-burger ako kanina",
    isHost: false,
  },
  {
    author: "Dave",
    time: "12:05 PM",
    text: "Pass sa spicy food din and preferably walking distance lang",
    isHost: false,
  },
  {
    author: "Maya",
    time: "12:28 PM",
    text: "Guys 25 minutes na tayong nakatayo sa lobby 😭💀",
    isHost: true,
  },
]

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: "01",
    title: "Create a Room",
    tagline: "Instant setup in 10 seconds",
    description: "Enter your host name, set your group size (up to 25 people), and choose how many places to review.",
    highlight: "Zero signups or app downloads needed.",
    badge: "Host",
  },
  {
    number: "02",
    title: "Set Preferences",
    tagline: "Tailored to your mood & location",
    description: "Pick categories like Food, Coffee, or Entertainment, define your budget tier (₱ to ₱₱₱₱), and set a walking or driving radius.",
    highlight: "Powered by live Google Places data.",
    badge: "Filters",
  },
  {
    number: "03",
    title: "Everyone Swipes",
    tagline: "Private & independent votes",
    description: "Share the short room code or QR. Everyone swipes right to Go or left to Pass on their own phone at their own pace.",
    highlight: "No peer pressure. No judgment.",
    badge: "Voting",
  },
  {
    number: "04",
    title: "Get The Group Match",
    tagline: "One clear winner revealed",
    description: "Once the last participant finishes, Spontee instantly evaluates all ballots and crowns the unanimous Consensus or optimal Compromise.",
    highlight: "Decision made. Directions ready.",
    badge: "Result",
  },
]

export const FEATURES: FeatureItem[] = [
  {
    id: "feature-swipe",
    title: "Tactile Swipe Voting",
    description: "Swipe right for 'Go!' or left for 'Pass!'. Smooth physics, gesture triggers, and keyboard arrow controls make voting feel as natural as swiping photos.",
    badge: "Intuitive UX",
    iconName: "Flame",
    gradient: "from-pink-500/10 via-purple-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
  {
    id: "feature-consensus",
    title: "Consensus & Compromise Engine",
    description: "Spontee analyzes every participant's votes to detect unanimous favorites, or computes the highest-rated fair compromise if opinions diverge.",
    badge: "Fair Results",
    iconName: "Trophy",
    gradient: "from-amber-500/10 via-pink-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    id: "feature-places",
    title: "Live Google Places Integration",
    description: "Real-world venue cards populated with actual Google star ratings, user review counts, price tiers, categories, and high-res photos.",
    badge: "Real-world Data",
    iconName: "MapPin",
    gradient: "from-blue-500/10 via-cyan-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    id: "feature-realtime",
    title: "Real-time Participant Sync",
    description: "Built on Supabase Realtime channels. Watch friends join the lobby, track their voting progress live, and see results unveil simultaneously.",
    badge: "Supabase Realtime",
    iconName: "Zap",
    gradient: "from-emerald-500/10 via-teal-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
  {
    id: "feature-frictionless",
    title: "Zero-Friction Anonymous Entry",
    description: "No account registration, no passwords, no email verification. Just punch in your nickname or scan a QR code to jump straight into the room.",
    badge: "Instant Access",
    iconName: "Users",
    gradient: "from-purple-500/10 via-indigo-500/10 to-transparent",
    colSpan: "lg:col-span-1",
  },
  {
    id: "feature-session",
    title: "Smart Local Session Recovery",
    description: "Accidentally closed your tab or refreshed your phone? Spontee preserves your active room session so you can pick right back up where you left off.",
    badge: "Reliable",
    iconName: "ShieldCheck",
    gradient: "from-rose-500/10 via-orange-500/10 to-transparent",
    colSpan: "lg:col-span-2",
  },
]