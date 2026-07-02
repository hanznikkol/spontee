import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsersRound } from "lucide-react";

interface RoomMaxParticipantsProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function RoomMaxParticipants({ value, onChange, min = 2, max = 100, }: RoomMaxParticipantsProps) {
    
  const handleIncrement = () => {
    onChange(Math.min(value + 1, max));
  };

  const handleDecrement = () => {
    onChange(Math.max(value - 1, min));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);

    if (Number.isNaN(newValue)) return;

    onChange(newValue);
  };

  const handleBlur = () => {
    onChange(Math.min(Math.max(value, min), max));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="max-participants">
            Maximum Participants
        </Label>
        
        <UsersRound className="w-4 h-4 text-muted-foreground"/>
      </div>
      

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          -
        </Button>

        <Input
          id="max-participants"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-10 text-center"
        />

        <Button
          type="button"
          variant="outline"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          +
        </Button>
      </div>

      <p className="text-sm text-muted-foreground italic">
        Between {min} and {max} participants.
      </p>
    </div>
  );
}

export default RoomMaxParticipants;