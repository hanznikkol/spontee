import { create } from "zustand";
import { DefaultCategory, RoomOption } from "../preference/option-types";
import { RoomVisibilityTypes } from "../room-types";

export interface CreateRoomState {
    hostName: string,
    roomName: string,
    roomVisibility: RoomVisibilityTypes,
    maxParticipants: number,
    roomPassword: string,
    selectedCategories: DefaultCategory[]
    options: RoomOption[]
}

interface CreateRoomStore extends CreateRoomState {
    setHostName: (name: string) => void
    setRoomName: (roomName: string) => void
    setRoomVisibility: (visibility: RoomVisibilityTypes) => void
    setRoomPassword: (password: string) => void
    setMaxParticipants: (value: number) => void
    setSelectedCategories: (categories: DefaultCategory[]) => void
    toggleCategory: (category: DefaultCategory) => void
    addOption: (option: RoomOption) => void
    editOption: (id: string, title: string) => void
    removeOption: (id: string) => void
    clearOptions: () => void
    reset: () => void
}

const initialState: CreateRoomState = {
  hostName: "",
  roomName: "",
  maxParticipants: 2,
  roomVisibility: "public",
  roomPassword: "",
  selectedCategories: [],
  options: [],
}

export const useCreateRoomStore = create<CreateRoomStore>((set) => ({
  ...initialState,
  setHostName: (hostName) => set({ hostName }),
  setRoomName: (roomName) => set({ roomName }),
  setRoomVisibility: (roomVisibility) => set({ roomVisibility }),
  setRoomPassword: (roomPassword) => set({ roomPassword }),
  setMaxParticipants: (value)  => set({maxParticipants: value}),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),
  toggleCategory: (category: DefaultCategory) =>
    set((state) => ({
        selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
  })),
  addOption: (option) =>
    set((state) => ({
      options: [...state.options, option],
    })),

   editOption: (id:string, title:string) =>
    set((state) => ({
      options: state.options.map((option) =>
        option.option_id === id
          ? { ...option, title }
          : option
      ),
    })),

   removeOption: (id) =>
    set((state) => ({
      options: state.options.filter((o) => o.option_id !== id),
    })),
    
  clearOptions: () => set({ options: [] }),
  reset: () => set(initialState),
}))