import { useCallback, useEffect, useState } from "react";
import { RoomOption } from "../../create/types/option-types";
import { getCurrentOption, removeCurrentOption } from "../helper/vote.helper";
import { getOptions, submitVote } from "../service/vote.service";
import  { useRouter } from "next/navigation";
import { SwipeDirection, Vote } from "../types/vote.types";
import { useRoomSessionStore } from "../../main/stores/room-session-store.store";
import { updateParticipantStatus } from "../../lobby/service/participant.service";

export function useVoting() {
    const router = useRouter()
    const participantId = useRoomSessionStore(state => state.participantId)
    const roomId = useRoomSessionStore(state => state.roomId)
    const roomCode = useRoomSessionStore(state => state.roomCode)
    const [options, setOptions] = useState<RoomOption[]>([])
    const [initialOptionCount, setInitialOptionCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [exitDirection, setExitDirection] = useState(0)

    const currentOption = getCurrentOption(options)
    const remainingOptions = options.length
    const currentCardNum = initialOptionCount > 0 ? initialOptionCount - remainingOptions + (currentOption ? 1 : 0) : 0;
    const progress = initialOptionCount > 0 ? (currentCardNum / initialOptionCount) * 100 : 0;
    const progressLabel = initialOptionCount > 0? `${currentCardNum} / ${initialOptionCount}` : ""

    // Fetch Options
    useEffect(() => {
        async function loadOptions() {
         if (!roomId) return;
            try {
                const fetchedOptions = await getOptions(roomId);
                setOptions(fetchedOptions);
                setInitialOptionCount(fetchedOptions.length);
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
            // Vote
            const vote: Vote = direction === "right" ? "go" : "pass"
            setExitDirection(direction === "right" ? 1 : -1)
            // Save votes to db
            await submitVote(roomId, currentOption.option_id, participantId, vote)

            if(options.length === 1) await updateParticipantStatus(participantId, "finished")
                
            setTimeout(() => {
                setOptions(prev => removeCurrentOption(prev));
            }, 150);

        } catch (error) {
            console.error(error)
        }
    }, [roomId, participantId, options, currentOption])

    useEffect(() => {
        if (!loading && !currentOption) {
            router.replace(`/room/${roomCode}/waiting`)
        }
    }, [loading, currentOption, roomId, router, roomCode])

    return {
        loading,
        currentOption,
        exitDirection,
        handleSwipe,

        initialOptionCount,
        currentCardNum,
        progress,
        progressLabel,
    }
}