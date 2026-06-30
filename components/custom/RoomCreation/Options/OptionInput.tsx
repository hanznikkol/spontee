import { FormEvent, KeyboardEvent } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MAX_OPTION_LENGTH = 48

type OptionInputProps = {
  value: string
  error?: string
  onChange: (value: string) => void
  onAdd: () => void
}

export function OptionInput({
  value,
  error,
  onChange,
  onAdd,
}: OptionInputProps) {
  const trimmedLength = value.trim().length
  const canAdd = trimmedLength > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      onAdd()
    }
  }

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="option-title">Add option</Label>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {value.length}/{MAX_OPTION_LENGTH}
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          id="option-title"
          value={value}
          maxLength={MAX_OPTION_LENGTH}
          placeholder="Type an idea, place, movie, or activity"
          aria-invalid={!!error}
          aria-describedby={error ? "option-input-error" : undefined}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_OPTION_LENGTH))}
          onKeyDown={handleKeyDown}
          className="h-10 rounded-xl"
        />
        <Button
          type="submit"
          size="lg"
          disabled={!canAdd}
          className="h-10 rounded-xl px-3"
          aria-label="Add option"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      {error && (
        <p id="option-input-error" className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
