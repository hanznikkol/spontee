import { Metadata } from "next"
import { verifyAdminSession } from "@/lib/feedback/actions/admin-auth.actions"
import { getAdminFeedbackList, getAdminFeedbackStats } from "@/lib/feedback/services/admin-feedback.service"
import { AdminLoginCard } from "@/components/custom/Admin/AdminLoginCard"
import { AdminFeedbackView } from "@/components/custom/Admin/AdminFeedbackView"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin Feedback Hub",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminFeedbackPage() {
  const isAuth = await verifyAdminSession()

  if (!isAuth) {
    return <AdminLoginCard />
  }

  const [feedbackList, feedbackStats] = await Promise.all([
    getAdminFeedbackList(),
    getAdminFeedbackStats(),
  ])

  return (
    <AdminFeedbackView
      initialFeedback={feedbackList}
      initialStats={feedbackStats}
    />
  )
}
