import { create } from "zustand";
import { RoomOption } from "../preference/option-types";
import { RoomVisibilityTypes } from "../room-types";
import { PreferenceBudget } from "../preference/budget";

// States
export interface CreateRoomState {
    hostName: string,
    roomName: string,
    roomVisibility: RoomVisibilityTypes,
    maxParticipants: number,
    roomPassword: string,
    selectedCategoriesIds: string[]
    options: RoomOption[]
    budget?: PreferenceBudget
    useLocation: boolean
    latitude?: number
    longitude?: number
}

// Actions
interface CreateRoomStore extends CreateRoomState {
    // Host Page
    setHostName: (name: string) => void
    // Room Setup
    setRoomName: (roomName: string) => void
    setRoomVisibility: (visibility: RoomVisibilityTypes) => void
    setRoomPassword: (password: string) => void
    setMaxParticipants: (value: number) => void
    setSelectedCategories: (categories: string[]) => void
    toggleCategory: (categoryId: string) => void
    addOption: (option: RoomOption) => void
    editOption: (id: string, title: string) => void
    removeOption: (id: string) => void
    clearOptions: () => void
    reset: () => void
    // Preference
    setBudget: (budget?: PreferenceBudget) => void
    setLocation: (
        enabled: boolean,
        latitude?: number,
        longitude?: number
    ) => void
}

// Initial Data State
const initialState: CreateRoomState = {
  hostName: "",
  roomName: "",
  maxParticipants: 2,
  roomVisibility: "public",
  roomPassword: "",
  selectedCategoriesIds: [],
  options: [],
  budget: "any",
  useLocation: false,
  latitude: undefined,
  longitude: undefined,
}

// Store
export const useCreateRoomStore = create<CreateRoomStore>((set) => ({
  ...initialState,
  setHostName: (hostName) => set({ hostName }),

  setRoomName: (roomName) => set({ roomName }),
  setRoomVisibility: (roomVisibility) => set({ roomVisibility }),
  setRoomPassword: (roomPassword) => set({ roomPassword }),
  setMaxParticipants: (value)  => set({maxParticipants: value}),
  setSelectedCategories: (selectedCategoriesIds) => set({ selectedCategoriesIds }),
  toggleCategory: (categoryId: string) => set((state) => {
    const selected = state.selectedCategoriesIds

    // Remove if already selected
    if (selected.includes(categoryId)) {
      return {
        selectedCategoriesIds: selected.filter(
          (id) => id !== categoryId
        ),
      }
    }

    // Maximum reached
    if (selected.length >= 3) {
      return {
        selectedCategoriesIds: selected
      }
    }

    // Add category
    return {
      selectedCategoriesIds: [...selected, categoryId],
    }
  }),
  addOption: (option) => set((state) => ({ options: [...state.options, option], })),
  editOption: (id:string, title:string) =>
    set((state) => ({
      options: state.options.map((option) =>
        option.option_id === id
          ? { ...option, title }
          : option
      ),
    })),
  removeOption: (id) => set((state) => ({ options: state.options.filter((o) => o.option_id !== id) })),
  clearOptions: () => set({ options: [] }),
  reset: () => set(initialState),

  setBudget: (budget) => {set({budget})},
  setLocation: (useLocation, latitude, longitude) => {set({useLocation, latitude, longitude})}
}))