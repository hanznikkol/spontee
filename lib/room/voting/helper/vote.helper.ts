import { RoomOption } from "../../create/types/option-types";

export function getCurrentOption(options: RoomOption[]) {
    return options[0] ?? null
}

export function removeCurrentOption(options: RoomOption[]) {
    return options.slice(1)
}

export function isVotingFinished(options: RoomOption[]) {
  return options.length === 0
}

// calculateWinner()

// getRemainingOptions()

// isVotingFinished()

// sortOptions()