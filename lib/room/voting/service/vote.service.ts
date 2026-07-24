import { supabase } from "@/lib/supabase/client";
import { DirectionTypes } from "../types/vote.types";

export async function getOptions(roomId: string) {
    return supabase
    .from('options')
    .select('*')
    .eq("room_id", roomId)
}

export function submitSwipe(roomId: string, optionId: string, participantId:string, direction: DirectionTypes) {
    return supabase
        .from('swipes')
        .insert({
            room_id: roomId,
            option_id: optionId,
            direction: direction,
            participant_id: participantId
        })
        .single()
}

export function subscribeSwipes() {}

export function finishVoting() {}

export function getWinner() {}