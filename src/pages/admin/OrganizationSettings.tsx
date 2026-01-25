import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Calendar, Link, Image } from "lucide-react";
import { format } from "date-fns";
import { LogoUpload } from "@/components/LogoUpload";

const OrganizationSettings = () => {
  const { organization } = useAuth();
  const { toast } = useToast();
  
  const [orgName, setOrgName] = useState(organization?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url || null);

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization name",
        variant: "destructive",
      });
      return;
    }

    if (!organization) return;

    setIsUpdating(true);

    // Generate new slug from name
    const newSlug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName.trim(), slug: newSlug })
      .eq("id", organization.id);

    setIsUpdating(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    }
  };

  const handleLogoUploadComplete = (url: string) => {
    setLogoUrl(url || null);
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization details
            </p>
          </div>

          {/* Organization Logo */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Organization Logo</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your company logo to display in the header and sidebar
                </p>
              </div>
            </div>

            {organization && (
              <LogoUpload
                currentLogoUrl={logoUrl}
                organizationId={organization.id}
                onUploadComplete={handleLogoUploadComplete}
              />
            )}
          </div>

          {/* Organization Info */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Organization Details</h2>
                <p className="text-sm text-muted-foreground">Update your organization information</p>
              </div>
            </div>

            <form onSubmit={handleUpdateOrganization} className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="ShellStar Custom Cabinets"
                  className="mt-1"
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </div>

          {/* Organization Meta */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Organization Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Link className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization Slug</p>
                  <p className="font-medium text-foreground">{organization?.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {organization?.created_at
                      ? format(new Date(organization.created_at), "MMMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
};

export default OrganizationSettings;
