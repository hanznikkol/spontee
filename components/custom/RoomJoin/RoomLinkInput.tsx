import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RoomLinkProps {
    value: string
    onChange: React.ChangeEventHandler<HTMLInputElement>
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}

function RoomLinkInput({value, onChange, onKeyDown}: RoomLinkProps) {
  return (
    <div className="space-y-2">
        <Label htmlFor="room-link">Invite Link</Label>
        <Input
            id="room-link"
            value={value}
            onChange={onChange}
            placeholder="Paste the host's link or room ID"
            className="rounded-xl"
            onKeyDown={onKeyDown}
        />
        <p className="text-xs text-muted-foreground">
            We accept full links like <span className="font-mono">/join?room=abc</span>, <span className="font-mono">/room/abc/lobby</span>, or just the room ID.
        </p>
    </div>
  )
}

export default RoomLinkInput