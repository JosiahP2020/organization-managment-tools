import { useState } from "react";
import { Type, MapPin, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IconPicker } from "@/components/menu-config/IconPicker";

type TextSubType = "text" | "address" | "lockbox";

interface AddTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; icon: string; subType: TextSubType }) => void;
  isPending?: boolean;
}

const SUB_TYPE_CONFIG: Record<TextSubType, { label: string; icon: string; placeholder: string; lockedIcon: boolean }> = {
  text: { label: "Text", icon: "type", placeholder: "Enter display text...", lockedIcon: false },
  address: { label: "Address", icon: "map-pin", placeholder: "Enter address...", lockedIcon: true },
  lockbox: { label: "Lock Box Code", icon: "lock", placeholder: "Enter lock box code...", lockedIcon: true },
};

export function AddTextDialog({ open, onOpenChange, onSubmit, isPending }: AddTextDialogProps) {
  const [subType, setSubType] = useState<TextSubType>("text");
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("type");

  const config = SUB_TYPE_CONFIG[subType];

  const handleSubTypeChange = (value: TextSubType) => {
    setSubType(value);
    setIcon(SUB_TYPE_CONFIG[value].icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ name: text.trim(), icon, subType });
    setText("");
    setSubType("text");
    setIcon("type");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setText("");
      setSubType("text");
      setIcon("type");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Text Display</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sub-type selection */}
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={subType}
              onValueChange={(v) => handleSubTypeChange(v as TextSubType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="text" id="text-type" />
                <Label htmlFor="text-type" className="flex items-center gap-1.5 cursor-pointer">
                  <Type className="h-4 w-4" />
                  Text
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="address" id="address-type" />
                <Label htmlFor="address-type" className="flex items-center gap-1.5 cursor-pointer">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="lockbox" id="lockbox-type" />
                <Label htmlFor="lockbox-type" className="flex items-center gap-1.5 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Lock Box Code
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Icon picker - only for "text" sub-type */}
          {!config.lockedIcon && (
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>
          )}

          {/* Text input */}
          <div className="space-y-2">
            <Label>{config.label}</Label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={config.placeholder}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!text.trim() || isPending}>
              {isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
