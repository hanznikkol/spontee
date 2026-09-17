import { useCallback, useEffect, useRef, useState } from "react";
import { RoomOption } from "../../create/types/option-types";
import { getCurrentOption, removeCurrentOption } from "../helper/vote.helper";
import { getOptions, submitVoteWithRetry, getParticipantVotes, SubmitVoteResult } from "../service/vote.service";
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
    const [userVotes, setUserVotes] = useState<UserVote[]>([])
    const [isFlushing, setIsFlushing] = useState(false)
    const [flushError, setFlushError] = useState<string | null>(null)

    const userVotesRef = useRef<UserVote[]>([])
    const pendingVotesRef = useRef<Map<string, { promise: Promise<SubmitVoteResult>; optionId: string; vote: Vote }>>(new Map())
    const failedVotesRef = useRef<Map<string, Vote>>(new Map())

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
                        userVotesRef.current = currentRoundSwipes;
                        setUserVotes(currentRoundSwipes);
                    } catch {
                        // Fallback to presenting full current round
                    }
                }

                if (unswipedOptions.length === 0 && currentRound.length > 0 && roomCode) {
                    router.replace(`/room/${roomCode}/waiting`);
                    return;
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
    }, [roomId, participantId, roomCode, router])

    // Handle Votes
    const handleSwipe = useCallback((direction: SwipeDirection) => {
        if (!roomId || !currentOption || !participantId || isFlushing) return
        try {
            // Vote
            const vote: Vote = direction === "right" ? "go" : "pass"
            const swipedOption = currentOption

            const newVoteRecord: UserVote = {
                option_id: swipedOption.option_id,
                title: swipedOption.title,
                address: swipedOption.address,
                rating: swipedOption.rating,
                price_level: swipedOption.priceLevel,
                image_urls: swipedOption.imageUrls,
                vote,
                swiped_at: new Date().toISOString(),
            }

            // Record locally immediately
            userVotesRef.current = [newVoteRecord, ...userVotesRef.current]
            setUserVotes(prev => [newVoteRecord, ...prev])

            // Kick off submission immediately in background, tracked in pendingVotesRef
            const optionId = swipedOption.option_id
            const submissionPromise = submitVoteWithRetry(roomId, optionId, participantId, vote)
                .then((result) => {
                    pendingVotesRef.current.delete(optionId)
                    failedVotesRef.current.delete(optionId)
                    return result
                })
                .catch((err) => {
                    console.error(`Vote submission failed for option ${optionId}:`, err)
                    pendingVotesRef.current.delete(optionId)
                    failedVotesRef.current.set(optionId, vote)
                    throw err
                })

            pendingVotesRef.current.set(optionId, {
                promise: submissionPromise,
                optionId,
                vote,
            })

            // Advance immediately so UI transitions at 60 FPS without network latency
            setOptions(prev => removeCurrentOption(prev))

        } catch (error) {
            console.error(error)
        }
    }, [roomId, participantId, currentOption, isFlushing])

    // Flush pending votes and navigate safely only when confirmed
    const flushAndNavigate = useCallback(async () => {
        if (!roomId || !participantId || !roomCode) return
        setIsFlushing(true)
        setFlushError(null)

        try {
            // 1. Await all pending in-flight submissions to settle
            while (pendingVotesRef.current.size > 0) {
                const currentPromises = Array.from(pendingVotesRef.current.values()).map(entry =>
                    entry.promise.catch(() => null)
                )
                await Promise.all(currentPromises)
            }

            // 2. Retry any submissions that previously failed
            if (failedVotesRef.current.size > 0) {
                const retryEntries = Array.from(failedVotesRef.current.entries())
                for (const [failedOptionId, failedVote] of retryEntries) {
                    try {
                        await submitVoteWithRetry(roomId, failedOptionId, participantId, failedVote, 2)
                        failedVotesRef.current.delete(failedOptionId)
                    } catch (err) {
                        console.error(`Retry failed for option ${failedOptionId}:`, err)
                    }
                }
            }

            // 3. If any failed votes could not be resolved, halt and prompt retry
            if (failedVotesRef.current.size > 0) {
                setFlushError("Some votes could not be saved. Please check your connection and tap retry.")
                setIsFlushing(false)
                return
            }

            // 4. Double check database persistence to confirm all votes are recorded
            const persistedVotes = await getParticipantVotes(roomId, participantId)
            const persistedIds = new Set(persistedVotes.map(v => v.option_id))
            const missingVotes = userVotesRef.current.filter(uv => !persistedIds.has(uv.option_id))

            if (missingVotes.length > 0) {
                for (const missing of missingVotes) {
                    await submitVoteWithRetry(roomId, missing.option_id, participantId, missing.vote, 2)
                }
            }

            // 5. All votes confirmed in Supabase! Safe to navigate to waiting room
            router.replace(`/room/${roomCode}/waiting`)
        } catch (err) {
            console.error("Error confirming final votes:", err)
            setFlushError("Failed to confirm all votes with the server. Tap retry to finish.")
            setIsFlushing(false)
        }
    }, [roomId, participantId, roomCode, router])

    // Trigger flush when all cards have been swiped
    useEffect(() => {
        if (!loading && !currentOption && initialOptionCount > 0 && !isFlushing && !flushError) {
            flushAndNavigate()
        }
    }, [loading, currentOption, initialOptionCount, isFlushing, flushError, flushAndNavigate])

    const retryFlush = useCallback(() => {
        setFlushError(null)
        flushAndNavigate()
    }, [flushAndNavigate])

    return {
        loading,
        currentOption,
        nextOption,
        handleSwipe,

        initialOptionCount,
        currentCardNum,
        progress,
        progressLabel,

        userVotes,
        goCount,
        passCount,

        isFlushing,
        flushError,
        retryFlush,
    }
}