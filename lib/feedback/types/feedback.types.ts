export interface Feedback {
  feedback_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  message: string | null;
  created_at: string;
}

export interface SubmitFeedbackDTO {
  rating: number;
  message?: string;
  user_name?: string;
  user_id?: string | null;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  withMessageCount: number;
}

export type FeedbackSortOption = "newest" | "oldest" | "highest" | "lowest";
