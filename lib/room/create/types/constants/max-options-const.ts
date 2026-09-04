export const MAX_OPTIONS_VALUES = [5, 10, 15, 20] as const
export type MaxOptionsValue = (typeof MAX_OPTIONS_VALUES)[number]