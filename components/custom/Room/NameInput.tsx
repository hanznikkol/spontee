import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

interface NameInputProps {
  title: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
  placeholder?: string
}

export default function NameInput({ title, value, onChange, onKeyDown, placeholder}: NameInputProps) {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <Input
        autoFocus
        maxLength={20}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}