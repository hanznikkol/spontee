import { useCallback, useEffect, useState } from "react";
import { RoomOption } from "../../create/types/option-types";
import { getCurrentOption, removeCurrentOption } from "../helper/vote.helper";
import { getOptions, submitSwipe } from "../service/vote.service";
import  { useRouter } from "next/navigation";
import { DirectionTypes } from "../types/vote.types";
import { useRoomSessionStore } from "../../stores/room-session-store.store";

export function useVoting() {
    const router = useRouter()
    const participantId = useRoomSessionStore(state => state.participantId)
    const roomId = useRoomSessionStore(state => state.roomId)
    const roomCode = useRoomSessionStore(state => state.roomCode)
    const [options, setOptions] = useState<RoomOption[]>([])
    const [loading, setLoading] = useState(true)
    const [exitDirection, setExitDirection] = useState(0)
    const currentOption = getCurrentOption(options)

    // Fetch Options
    useEffect(() => {
        async function loadOptions() {
         if (!roomId) return;
            try {
                // Options
                const { data, error } = await getOptions(roomId)
                if (error) throw error
                if (!data) return
                setOptions(data)
                
            } finally {
                setLoading(false)
            }
        }

        loadOptions()
    }, [roomId])

    // Handle Votes
    const handleSwipe = useCallback(async (direction: DirectionTypes) => {
        if (!roomId || !currentOption || !participantId) return
        try {
            setExitDirection(direction === "right" ? 1 : -1)
            await submitSwipe(roomId, currentOption.option_id, participantId, direction)
            setTimeout(() => {
                setOptions(prev => removeCurrentOption(prev))
            }, 150)

        } catch (error) {
            console.error(error)
        }
    }, [roomId, participantId, currentOption])

    useEffect(() => {
        if (!loading && !currentOption) {
            router.replace(`/room/${roomCode}/result`)
        }
    }, [loading, currentOption, roomId, router, roomCode])

    return {
        loading,
        options,
        currentOption,
        exitDirection,
        handleSwipe
    }
}