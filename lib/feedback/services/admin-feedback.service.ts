import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Feedback, FeedbackStats } from "../types/feedback.types";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Fetches all feedback records for the admin view.
 * Must only be called server-side.
 */
export async function getAdminFeedbackList(): Promise<Feedback[]> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("feedback_id, user_id, user_name, rating, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin feedback list:", error);
    throw new Error(error.message);
  }

  return (data || []) as Feedback[];
}

/**
 * Computes summary statistics over all feedback submissions.
 */
export async function getAdminFeedbackStats(): Promise<FeedbackStats> {
  const list = await getAdminFeedbackList();

  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let totalRatingSum = 0;
  let withMessageCount = 0;

  for (const item of list) {
    const r = item.rating as 1 | 2 | 3 | 4 | 5;
    if (breakdown[r] !== undefined) {
      breakdown[r]++;
    }
    totalRatingSum += item.rating;
    if (item.message && item.message.trim().length > 0) {
      withMessageCount++;
    }
  }

  const total = list.length;
  const averageRating = total > 0 ? Number((totalRatingSum / total).toFixed(1)) : 0;

  return {
    total,
    averageRating,
    ratingBreakdown: breakdown,
    withMessageCount,
  };
}

/**
 * Deletes a feedback item by ID.
 */
export async function deleteAdminFeedbackItem(feedbackId: string): Promise<boolean> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("feedback")
    .delete()
    .eq("feedback_id", feedbackId);

  if (error) {
    console.error("Error deleting feedback item:", error);
    throw new Error(error.message);
  }

  return true;
}
