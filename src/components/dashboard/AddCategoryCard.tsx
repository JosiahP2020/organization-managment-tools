import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { QuickCategoryDialog } from "./QuickCategoryDialog";

interface AddCategoryCardProps {
  onCreate: (data: { name: string; description?: string; icon: string; show_on_dashboard: boolean; show_in_sidebar: boolean }) => void;
}

export function AddCategoryCard({ onCreate }: AddCategoryCardProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card 
        className="group relative overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-muted/20 rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
          {/* Plus Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors duration-200">
            <Plus className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {/* Label */}
          <p className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
            Add Category
          </p>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <QuickCategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        mode="create"
        onSave={(data) => {
          onCreate(data);
          setShowDialog(false);
        }}
      />
    </>
  );
}
