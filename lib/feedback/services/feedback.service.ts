import { supabase } from "@/lib/supabase/client";
import { SubmitFeedbackDTO } from "../types/feedback.types";

/**
 * Submits feedback to Supabase.
 * Respects RLS: user_id is either current auth UID or null.
 * Does NOT chain .select() because public users have INSERT-only permission.
 */
export async function submitFeedback(payload: SubmitFeedbackDTO): Promise<{ success: boolean }> {
  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  // Attempt to link current auth user session if available, without forcing creation
  let userId: string | null = payload.user_id ?? null;
  if (!userId) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        userId = data.user.id;
      }
    } catch {
      // In case of auth retrieval issue, proceed with null user_id
      userId = null;
    }
  }

  const sanitizedName = payload.user_name?.trim() ? payload.user_name.trim().slice(0, 50) : null;
  const sanitizedMessage = payload.message?.trim() ? payload.message.trim().slice(0, 1000) : null;

  const { error } = await supabase.from("feedback").insert({
    rating: Math.round(payload.rating),
    message: sanitizedMessage,
    user_name: sanitizedName,
    user_id: userId,
  });

  if (error) {
    console.error("Failed to submit feedback:", error);
    throw new Error(error.message || "Failed to submit feedback. Please try again.");
  }

  return { success: true };
}
