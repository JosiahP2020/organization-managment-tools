import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconPicker } from "@/components/menu-config/IconPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddMenuCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId?: string | null;
}

export function AddMenuCardDialog({ open, onOpenChange, sectionId }: AddMenuCardDialogProps) {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("folder");

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id || !user?.id) {
        throw new Error("Organization or user not found");
      }

      // Get the max sort_order to place new card at the end
      const { data: existingCategories } = await supabase
        .from("menu_categories")
        .select("sort_order")
        .eq("organization_id", organization.id)
        .eq("show_on_dashboard", true)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextSortOrder = existingCategories?.[0]?.sort_order 
        ? existingCategories[0].sort_order + 1 
        : 0;

      const { error } = await supabase.from("menu_categories").insert({
        name: name.trim(),
        description: description.trim() || null,
        icon,
        organization_id: organization.id,
        created_by: user.id,
        show_on_dashboard: true,
        show_in_sidebar: true,
        sort_order: nextSortOrder,
        section_id: sectionId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-categories"] });
      toast.success("Menu card created successfully");
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create menu card:", error);
      toast.error("Failed to create menu card");
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("folder");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    createCategoryMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter menu card name"
              required
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description"
              rows={2}
              maxLength={255}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
