import { useState } from "react"
import { joinRoom } from "../service/join.service"
import { useRoomSessionStore } from "../../main/stores/room-session-store.store"

export function useJoinRoom(){
  const [joining,setJoining] = useState(false)
  const [feedback,setFeedback] = useState("")
  const setSession = useRoomSessionStore(state => state.setSession)

  const join = async(payload:{ roomCode:string, displayName:string })=>{
    setJoining(true)
    setFeedback("")

    try{
      const { room, participant } = await joinRoom(payload)
      
      setSession({
        roomId: room.room_id,
        participantId: participant.participant_id,
        isHost: participant.is_host,
      })
    
      return room

    }catch(error){
      const message = error instanceof Error ? error.message : "Unable to join the room right now."
      setFeedback(message)
      throw error

    }finally{
      setJoining(false)
    }
  }

  return {
    join,
    joining,
    feedback
  }
}