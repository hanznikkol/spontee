import { useCallback, useEffect, useState } from "react";
import { RoomOption } from "../../create/types/option-types";
import { getCurrentOption, removeCurrentOption } from "../helper/vote.helper";
import { getOptions, submitVote } from "../service/vote.service";
import  { useRouter } from "next/navigation";
import { SwipeDirection, Vote } from "../types/vote.types";
import { useRoomSessionStore } from "../../main/stores/room-session-store.store";
import { updateParticipantStatus } from "../../lobby/service/lobby.service";

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
                const options = await getOptions(roomId);
                setOptions(options);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadOptions()
    }, [roomId])

    // Handle Votes
    const handleSwipe = useCallback(async (direction: SwipeDirection) => {
        if (!roomId || !currentOption || !participantId) return
        try {
            const vote: Vote = direction === "right" ? "GO" : "PASS"
            setExitDirection(direction === "right" ? 1 : -1)
            await submitVote(roomId, currentOption.option_id, participantId, vote)

            const remainingOptions = removeCurrentOption(options)
            const finished = remainingOptions.length === 0

            
            setTimeout(async () => {
                setOptions(prev => removeCurrentOption(prev))
                if (finished) {
                    await updateParticipantStatus(
                        participantId,
                        'finished'
                    )
                }
            }, 150)

        } catch (error) {
            console.error(error)
        }
    }, [roomId, participantId, currentOption, options])

    useEffect(() => {
        if (!loading && !currentOption) {
            router.replace(`/room/${roomCode}/waiting`)
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