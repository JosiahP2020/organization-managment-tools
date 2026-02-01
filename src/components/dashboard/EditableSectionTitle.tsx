import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableSectionTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isEditable?: boolean;
  className?: string;
}

export function EditableSectionTitle({
  title,
  onTitleChange,
  isEditable = true,
  className,
}: EditableSectionTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange(trimmed);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing && isEditable) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-8 text-lg font-semibold bg-transparent border-primary/30 focus:border-primary",
          "w-auto min-w-[120px] max-w-[300px]",
          className
        )}
      />
    );
  }

  return (
    <h2
      onClick={() => isEditable && setIsEditing(true)}
      className={cn(
        "text-lg font-semibold text-foreground",
        isEditable && "cursor-pointer hover:text-primary transition-colors",
        className
      )}
      title={isEditable ? "Click to edit" : undefined}
    >
      {title}
    </h2>
  );
}
