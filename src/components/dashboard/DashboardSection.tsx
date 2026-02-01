import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDashboardSections, type SectionWithCategories } from "@/hooks/useDashboardSections";
import type { DashboardCategory } from "@/hooks/useDashboardCategories";
import { AddMenuCardButton } from "./AddMenuCardButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardSectionProps {
  section: SectionWithCategories;
  CardComponent: React.ComponentType<{
    category: DashboardCategory;
    onClick: () => void;
    showEditButton: boolean;
  }>;
  onCategoryClick: (category: DashboardCategory) => void;
  onAddMenu: (sectionId: string) => void;
}

export function DashboardSection({
  section,
  CardComponent,
  onCategoryClick,
  onAddMenu,
}: DashboardSectionProps) {
  const { isAdmin } = useAuth();
  const { updateSection, deleteSection } = useDashboardSections();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    if (isAdmin) {
      setEditValue(section.title);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== section.title) {
      updateSection.mutate({ id: section.id, title: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(section.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deleteSection.mutate(section.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  // Split categories to insert title in the middle
  const midpoint = Math.ceil(section.categories.length / 2);
  const firstHalf = section.categories.slice(0, midpoint);
  const secondHalf = section.categories.slice(midpoint);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start content-start">
        {/* First half of cards */}
        {firstHalf.map((category) => (
          <CardComponent
            key={category.id}
            category={category}
            onClick={() => onCategoryClick(category)}
            showEditButton={false}
          />
        ))}

        {/* Section Title - spans full width, centered */}
        <div className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 py-2 group">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold h-9 max-w-xs text-center"
              maxLength={100}
            />
          ) : (
            <h2
              onClick={handleTitleClick}
              className={cn(
                "text-lg font-semibold text-foreground",
                isAdmin && "cursor-pointer hover:text-primary transition-colors"
              )}
            >
              {section.title}
            </h2>
          )}

          {isAdmin && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Second half of cards */}
        {secondHalf.map((category) => (
          <CardComponent
            key={category.id}
            category={category}
            onClick={() => onCategoryClick(category)}
            showEditButton={false}
          />
        ))}

        {/* Add menu button */}
        {isAdmin && (
          <div className="flex h-16 md:h-20 items-center justify-center">
            <AddMenuCardButton onAddMenu={() => onAddMenu(section.id)} />
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{section.title}"? Menu cards in this section will become unsorted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
