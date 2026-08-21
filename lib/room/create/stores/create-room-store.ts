import { create } from "zustand";
import { persist } from "zustand/middleware"
import { RoomOption } from "../types/option-types";
import { PreferenceBudget } from "../types/budget";
import { LocationStatus } from "../types/location";

export interface LocationPreferenceData {
  placeId?: string
  placeName?: string
  address: string
  latitude: number
  longitude: number
}

export interface CoordinateLocationData {
  status?: Exclude<LocationStatus, "required">
  placeId?: string
  placeName?: string
  address?: string
}

// States
export interface CreateRoomState {
    hostName: string,
    // Room Preference
    roomName: string,
    maxParticipants: number,
    selectedCategoriesbyNames: string[]
    options: RoomOption[]
    budget?: PreferenceBudget
    // Location
    locationStatus: LocationStatus
    placeId?: string
    placeName?: string
    address: string
    latitude?: number
    longitude?: number
    radius: number
}

// Actions
interface CreateRoomStore extends CreateRoomState {
    // Host Page
    setHostName: (name: string) => void
    // Room Setup
    setRoomName: (roomName: string) => void
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
      status: Exclude<LocationStatus, "required">,
      data: LocationPreferenceData
    ) => void
    setCoordinates: (
      latitude: number,
      longitude: number,
      data?: CoordinateLocationData
    ) => void
    clearLocation: () => void
    setRadius: (radius: number) => void
}

// Initial Data State
const initialState: CreateRoomState = {
  hostName: "",
  roomName: "",
  maxParticipants: 2,
  selectedCategoriesbyNames: [],
  options: [],
  budget: "any",
  latitude: undefined,
  longitude: undefined,
  locationStatus: "required",
  address: "",
  radius: 1000,
}

// Store
export const useCreateRoomStore = create<CreateRoomStore>()(
  persist(
    (set) => ({
      ...initialState,
      setHostName: (hostName) => set({ hostName }),
      setRoomName: (roomName) => set({ roomName }),
      setMaxParticipants: (value)  => set({maxParticipants: value}),
      setSelectedCategories: (selectedCategoriesbyNames) => set({ selectedCategoriesbyNames }),

      toggleCategory: (categoryName: string) => set((state) => {
        const selected = state.selectedCategoriesbyNames

        // Remove if already selected
        if (selected.includes(categoryName)) {
          return {
            selectedCategoriesbyNames: selected.filter(
              (id) => id !== categoryName
            ),
          }
        }

        // Maximum reached
        if (selected.length >= 3) {
          return {
            selectedCategoriesbyNames: selected
          }
        }

        // Add category
        return {
          selectedCategoriesbyNames: [...selected, categoryName],
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

      // Location
      setLocation: (status, data) =>
        set({
          locationStatus: status,
          placeId: data.placeId,
          placeName: data.placeName,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
      }),
      clearLocation: () =>
        set({
          locationStatus: "required",
          placeId: undefined,
          placeName: undefined,
          address: "",
          latitude: undefined,
          longitude: undefined,
        }),
      setCoordinates: (latitude, longitude, data) =>
        set({
          latitude,
          longitude,
          ...(data?.status ? { locationStatus: data.status } : {}),
          ...(data && "placeId" in data ? { placeId: data.placeId } : {}),
          ...(data && "placeName" in data ? { placeName: data.placeName } : {}),
          ...(data && "address" in data ? { address: data.address } : {}),
        }),
      setRadius: (radius) => set({ radius }),
    }),
    {
      name: "spontee-create-room",
    }
  )
)
