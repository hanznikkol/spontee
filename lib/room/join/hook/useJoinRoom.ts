import { useState } from "react"
import { joinRoom } from "../service/join.service"

export function useJoinRoom(){
  const [joining,setJoining] = useState(false)
  const [feedback,setFeedback] = useState("")

  const join = async(payload:{ roomCode:string, displayName:string })=>{
    setJoining(true)
    setFeedback("")

    try{
      const room = await joinRoom(payload)
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