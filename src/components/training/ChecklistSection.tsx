import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { ChecklistItem } from "@/components/training/ChecklistItem";
import { AddItemDialog } from "@/components/training/AddItemDialog";
import type { ChecklistSectionType, ChecklistItem as ChecklistItemType } from "@/pages/training/ChecklistEditor";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  hideCompleted: boolean;
  canEdit: boolean;
  checklistId: string;
}

export function ChecklistSection({
  section,
  hideCompleted,
  canEdit,
  checklistId,
}: ChecklistSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const queryClient = useQueryClient();

  // Build a tree of items (top-level items with their children)
  const buildItemTree = (items: ChecklistItemType[]): ChecklistItemType[] => {
    const topLevelItems = items.filter(item => !item.parent_item_id);
    return topLevelItems;
  };

  const getChildItems = (parentId: string): ChecklistItemType[] => {
    return section.items.filter(item => item.parent_item_id === parentId);
  };

  const topLevelItems = buildItemTree(section.items);

  // Filter items if hideCompleted is true
  const visibleItems = hideCompleted
    ? topLevelItems.filter(item => !item.is_completed)
    : topLevelItems;

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("checklist_sections")
        .delete()
        .eq("id", section.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-sections", checklistId] });
      toast.success("Section deleted");
    },
    onError: () => {
      toast.error("Failed to delete section");
    },
  });

  const handleDeleteSection = () => {
    if (window.confirm(`Are you sure you want to delete "${section.title}"? All items in this section will be deleted.`)) {
      deleteSectionMutation.mutate();
    }
  };

  const completedCount = section.items.filter(i => i.is_completed).length;
  const totalCount = section.items.length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:text-primary transition-colors">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </button>
            </CollapsibleTrigger>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
              </span>
              
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDeleteSection}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {visibleItems.length > 0 ? (
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    getChildItems={getChildItems}
                    hideCompleted={hideCompleted}
                    canEdit={canEdit}
                    checklistId={checklistId}
                    sectionId={section.id}
                    depth={0}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                {hideCompleted ? "All items completed" : "No items in this section"}
              </p>
            )}

            {/* Add Item Button */}
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setAddItemOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        sectionId={section.id}
        checklistId={checklistId}
        nextSortOrder={section.items.length}
      />
    </Card>
  );
}
