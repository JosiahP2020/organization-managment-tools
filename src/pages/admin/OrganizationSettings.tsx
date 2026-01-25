import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Calendar, Key, Image, Save } from "lucide-react";
import { format } from "date-fns";
import { DualLogoUpload } from "@/components/DualLogoUpload";

const OrganizationSettings = () => {
  const { organization } = useAuth();
  const { toast } = useToast();
  
  const [orgName, setOrgName] = useState(organization?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [mainLogoUrl, setMainLogoUrl] = useState<string | null>(null);
  const [subLogoUrl, setSubLogoUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize state from organization data
  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "");
      setMainLogoUrl(organization.main_logo_url || organization.logo_url || null);
      setSubLogoUrl(organization.sub_logo_url || null);
    }
  }, [organization]);

  // Track changes
  useEffect(() => {
    if (!organization) return;
    
    const originalMainLogo = organization.main_logo_url || organization.logo_url || null;
    const originalSubLogo = organization.sub_logo_url || null;
    
    const changed = 
      orgName !== organization.name ||
      mainLogoUrl !== originalMainLogo ||
      subLogoUrl !== originalSubLogo;
    
    setHasChanges(changed);
  }, [orgName, mainLogoUrl, subLogoUrl, organization]);

  const handleSaveAll = async () => {
    if (!organization) return;

    if (!orgName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization name",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    // Generate new slug from name
    const newSlug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error } = await supabase
      .from("organizations")
      .update({ 
        name: orgName.trim(), 
        slug: newSlug,
        main_logo_url: mainLogoUrl,
        sub_logo_url: subLogoUrl,
        logo_url: mainLogoUrl, // Keep legacy field in sync
      })
      .eq("id", organization.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Organization settings saved successfully",
      });
      setHasChanges(false);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization details and branding
            </p>
          </div>

          {/* Organization Logos */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Organization Logos</h2>
                <p className="text-sm text-muted-foreground">
                  Upload logos to customize your organization's branding
                </p>
              </div>
            </div>

            {organization && (
              <DualLogoUpload
                mainLogoUrl={mainLogoUrl}
                subLogoUrl={subLogoUrl}
                organizationId={organization.id}
                onMainLogoChange={setMainLogoUrl}
                onSubLogoChange={setSubLogoUrl}
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

            <div className="space-y-4">
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
            </div>
          </div>

          {/* Organization Meta */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Organization Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Key className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization Code</p>
                  <p className="font-medium text-foreground">{organization?.slug}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This is the code employees use to sign in to your organization
                  </p>
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveAll} 
              disabled={isSaving || !hasChanges}
              className="gap-2"
              size="lg"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save All Changes
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
};

export default OrganizationSettings;
