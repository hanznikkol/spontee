import { Option } from "../options/option-types"

export type Room = {
  id: string
  name: string
  options: Option[]
}