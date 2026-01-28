import { Link } from "react-router-dom";
import { Settings2, FolderPlus, FileText, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminGetStartedCard() {
  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          As an admin, you can configure the navigation and content for your organization.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <FolderPlus className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Create categories & subcategories</span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Add file directories & documents</span>
          </div>
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Set up checklists & guides</span>
          </div>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/menu-config">
            Configure Navigation
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
