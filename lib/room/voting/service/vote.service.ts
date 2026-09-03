import { supabase } from "@/lib/supabase/client";
import { UserVote, Vote } from "../types/vote.types";
import { RoomOption } from "../../create/types/option-types";

export async function getOptions(roomId: string): Promise<RoomOption[]> {
    const { data, error } = await supabase
        .from("options")
        .select("*")
        .eq("room_id", roomId);

    if (error) throw error;

    return (data ?? []).map(option => ({
        option_id: option.option_id,
        title: option.title,
        description: option.description,
        googlePlaceId: option.google_place_id,
        address: option.address,
        latitude: option.latitude,
        longitude: option.longitude,
        rating: option.rating,
        totalReviews: option.total_reviews,
        imageUrls: option.image_urls ?? [],
        priceLevel: option.price_level,
        distanceMeters: option.distance_meters ?? undefined,
        created_at: option.created_at ?? undefined,
    }));
}

export async function submitVote(roomId: string, optionId: string, participantId:string, vote: Vote) {
    const { data, error } = await supabase.rpc("submit_vote", {
        p_room_id: roomId,
        p_option_id: optionId,
        p_participant_id: participantId,
        p_vote: vote,
    });
    
    if(error) throw error
    return data
}

interface SwipeWithOptionRow {
  swipe_id: string
  option_id: string
  vote: string
  swiped_at: string
  options:
    | {
        option_id?: string
        title?: string | null
        address?: string | null
        rating?: number | null
        price_level?: number | null
        image_urls?: string[] | null
      }
    | {
        option_id?: string
        title?: string | null
        address?: string | null
        rating?: number | null
        price_level?: number | null
        image_urls?: string[] | null
      }[]
    | null
}

export async function getParticipantVotes(roomId: string, participantId: string): Promise<UserVote[]> {
    const { data, error } = await supabase
        .from("swipes")
        .select(`
            swipe_id,
            option_id,
            vote,
            swiped_at,
            options (
                option_id,
                title,
                address,
                rating,
                price_level,
                image_urls
            )
        `)
        .eq("room_id", roomId)
        .eq("participant_id", participantId)
        .order("swiped_at", { ascending: false });

    if (error) throw error;

    const rows = (data ?? []) as unknown as SwipeWithOptionRow[];

    return rows.map((row) => {
        const option = Array.isArray(row.options) ? row.options[0] : row.options;
        return {
            swipe_id: row.swipe_id,
            option_id: row.option_id,
            vote: row.vote as Vote,
            swiped_at: row.swiped_at,
            title: option?.title ?? "Unknown Place",
            address: option?.address ?? null,
            rating: option?.rating ?? null,
            price_level: option?.price_level ?? null,
            image_urls: option?.image_urls ?? [],
        };
    });
}
