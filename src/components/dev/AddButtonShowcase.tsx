import { Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AddButtonShowcase = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add Item Button Styles</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select a style for the "Add Item" button used to add new menus, tools, and content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 1. Current Dashed Circle */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">1. Current Dashed Circle</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-primary hover:bg-accent/50 transition-all">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* 2. Text Link */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">2. Text Link</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </div>

        {/* 3. Ghost Button */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">3. Ghost Button</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          </div>
        </div>

        {/* 4. Outlined Rectangular */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">4. Outlined Rectangular</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <Button variant="outline" className="border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          </div>
        </div>

        {/* 5. Floating Action (FAB) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">5. Floating Action (FAB)</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 6. Inline Text */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">6. Inline Text</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="text-muted-foreground hover:text-primary text-sm transition-colors">
              + Add
            </button>
          </div>
        </div>

        {/* 7. Subtle Card */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">7. Subtle Card</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="w-full max-w-[200px] bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 hover:bg-muted/50 hover:border-primary/50 transition-all flex flex-col items-center gap-2">
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add item</span>
            </button>
          </div>
        </div>

        {/* 8. Icon with Tooltip */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">8. Icon with Tooltip</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="h-10 w-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all">
                    <Plus className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* 9. Expandable */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">9. Expandable (hover)</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="group h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all px-3 hover:px-4">
              <Plus className="h-5 w-5" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 whitespace-nowrap ml-0 group-hover:ml-2 text-sm">
                Add item
              </span>
            </button>
          </div>
        </div>

        {/* 10. Pill Outline */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">10. Pill Outline</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </div>

        {/* 11. Gradient Button */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">11. Gradient Button</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/70 text-primary-foreground hover:shadow-lg transition-all text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </div>

        {/* 12. Minimal Circle */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">12. Minimal Circle</span>
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center">
            <button className="h-8 w-8 rounded-full border border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:text-primary transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddButtonShowcase;
