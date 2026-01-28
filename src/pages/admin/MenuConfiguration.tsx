import { DashboardLayout } from "@/components/DashboardLayout";
import { BackButton } from "@/components/BackButton";
import { MenuCategoryEditor } from "@/components/menu-config/MenuCategoryEditor";
import { AdminRoute } from "@/components/AdminRoute";

export default function MenuConfiguration() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Menu Configuration</h1>
              <p className="text-muted-foreground">
                Customize your organization's navigation structure
              </p>
            </div>
          </div>

          <MenuCategoryEditor />

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-medium mb-2">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Categories</strong> appear in the sidebar and/or dashboard as navigation items</li>
              <li>• <strong>Submenus</strong> link to other categories for nested navigation</li>
              <li>• <strong>File Directories</strong> let users upload and search documents</li>
              <li>• <strong>Tools</strong> (Checklists, SOP Guides, Project Hubs) create specialized content</li>
              <li>• Use <strong>Unlimited</strong> mode for multiple documents, <strong>Single</strong> for just one</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
