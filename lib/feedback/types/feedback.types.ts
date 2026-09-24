export type FeedbackSource = "home" | "session";
export type SessionHelpfulResponse = "yes" | "a_little" | "not_really";

export interface Feedback {
  feedback_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  message: string | null;
  created_at: string;
  source?: FeedbackSource;
  helpful_response?: SessionHelpfulResponse | null;
  room_code?: string | null;
  room_id?: string | null;
}

export interface SubmitFeedbackDTO {
  rating: number;
  message?: string;
  user_name?: string;
  user_id?: string | null;
  source?: FeedbackSource;
  helpful_response?: SessionHelpfulResponse | null;
  room_code?: string | null;
  room_id?: string | null;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  withMessageCount: number;
}

export type FeedbackSortOption = "newest" | "oldest" | "highest" | "lowest";
