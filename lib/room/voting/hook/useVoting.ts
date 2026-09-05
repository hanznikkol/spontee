import { useCallback, useEffect, useState } from "react";
import { RoomOption } from "../../create/types/option-types";
import { getCurrentOption, removeCurrentOption } from "../helper/vote.helper";
import { getOptions, submitVote, getParticipantVotes } from "../service/vote.service";
import  { useRouter } from "next/navigation";
import { SwipeDirection, UserVote, Vote } from "../types/vote.types";
import { useRoomSessionStore } from "../../main/stores/room-session-store.store";
import { getCurrentRoundOptions } from "../../result/service/result.service";

export function useVoting() {
    const router = useRouter()
    const participantId = useRoomSessionStore(state => state.participantId)
    const roomId = useRoomSessionStore(state => state.roomId)
    const roomCode = useRoomSessionStore(state => state.roomCode)
    const [options, setOptions] = useState<RoomOption[]>([])
    const [initialOptionCount, setInitialOptionCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [exitDirection, setExitDirection] = useState(0)
    const [userVotes, setUserVotes] = useState<UserVote[]>([])

    const currentOption = getCurrentOption(options)
    const nextOption = options.length > 1 ? options[1] : null
    const remainingOptions = options.length
    const currentCardNum = initialOptionCount > 0 ? initialOptionCount - remainingOptions + (currentOption ? 1 : 0) : 0;
    const progress = initialOptionCount > 0 ? (currentCardNum / initialOptionCount) * 100 : 0;
    const progressLabel = initialOptionCount > 0? `${currentCardNum} / ${initialOptionCount}` : ""

    const goCount = userVotes.filter(v => v.vote === "go").length
    const passCount = userVotes.filter(v => v.vote === "pass").length

    // Fetch Options
    useEffect(() => {
        async function loadOptions() {
         if (!roomId) return;
            try {
                const fetchedOptions = await getOptions(roomId);
                const currentRound = getCurrentRoundOptions(fetchedOptions);

                // If participantId exists, filter out already swiped cards in this round
                let unswipedOptions = currentRound;
                if (participantId) {
                    try {
                        const previousSwipes = await getParticipantVotes(roomId, participantId);
                        const swipedIds = new Set(previousSwipes.map(s => s.option_id));
                        unswipedOptions = currentRound.filter(o => !swipedIds.has(o.option_id));

                        const currentRoundSwipes = previousSwipes.filter(s =>
                            currentRound.some(o => o.option_id === s.option_id)
                        );
                        setUserVotes(currentRoundSwipes);
                    } catch {
                        // Fallback to presenting full current round
                    }
                }

                setOptions(unswipedOptions);
                setInitialOptionCount(currentRound.length);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadOptions()
    }, [roomId, participantId])

    // Handle Votes
    const handleSwipe = useCallback((direction: SwipeDirection) => {
        if (!roomId || !currentOption || !participantId) return
        try {
            // Vote
            const vote: Vote = direction === "right" ? "go" : "pass"
            const swipedOption = currentOption
            setExitDirection(direction === "right" ? 1 : -1)

            // Record locally immediately
            setUserVotes(prev => [
                {
                    option_id: swipedOption.option_id,
                    title: swipedOption.title,
                    address: swipedOption.address,
                    rating: swipedOption.rating,
                    price_level: swipedOption.priceLevel,
                    image_urls: swipedOption.imageUrls,
                    vote,
                    swiped_at: new Date().toISOString(),
                },
                ...prev,
            ])

            // Save votes to db in background (optimistic / non-blocking)
            // submit_vote automatically marks participant finished when done
            submitVote(roomId, swipedOption.option_id, participantId, vote).catch((err) => {
                console.error("Failed to submit vote:", err)
            })

            // Advance immediately so UI transitions at 60 FPS without network latency
            setOptions(prev => removeCurrentOption(prev))

        } catch (error) {
            console.error(error)
        }
    }, [roomId, participantId, currentOption])

    useEffect(() => {
        if (!loading && !currentOption) {
            router.replace(`/room/${roomCode}/waiting`)
        }
    }, [loading, currentOption, roomId, router, roomCode])

    return {
        loading,
        currentOption,
        nextOption,
        exitDirection,
        handleSwipe,

        initialOptionCount,
        currentCardNum,
        progress,
        progressLabel,

        userVotes,
        goCount,
        passCount,
    }
}