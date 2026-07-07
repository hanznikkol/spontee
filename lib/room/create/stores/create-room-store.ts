import { create } from "zustand";
import { RoomOption } from "../preference/option-types";
import { RoomVisibilityTypes } from "../room-types";
import { PreferenceBudget } from "../preference/budget";
import { LocationStatus } from "../preference/location";

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
    roomVisibility: RoomVisibilityTypes,
    maxParticipants: number,
    roomPassword: string,
    selectedCategoriesIds: string[]
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
  roomVisibility: "public",
  roomPassword: "",
  selectedCategoriesIds: [],
  options: [],
  budget: "any",
  latitude: undefined,
  longitude: undefined,
  locationStatus: "required",
  address: "",
  radius: 3000,
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
}))
