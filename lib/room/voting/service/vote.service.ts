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
        imageUrl: option.image_url,
        priceLevel: option.price_level,
    }));
}
export function submitVote(roomId: string, optionId: string, participantId:string, vote: Vote) {
    return supabase
        .from('swipes')
        .insert({
            room_id: roomId,
            option_id: optionId,
            participant_id: participantId,
            vote,
        })
        .single()
}