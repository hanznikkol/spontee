import { supabase } from "@/lib/supabase/client";
import { Vote } from "../types/vote.types";
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