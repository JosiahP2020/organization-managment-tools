import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Calendar, Key, Image, Save, Type, Palette } from "lucide-react";
import { format } from "date-fns";
import { DualLogoUpload } from "@/components/DualLogoUpload";
import { AccentColorPicker } from "@/components/AccentColorPicker";

const OrganizationSettings = () => {
  const { organization, refreshOrganization } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mainLogoUrl, setMainLogoUrl] = useState<string | null>(null);
  const [subLogoUrl, setSubLogoUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [mainLogoColors, setMainLogoColors] = useState<Record<string, string>>({});
  const [subLogoColors, setSubLogoColors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize state from organization data
  useEffect(() => {
    if (organization) {
      setDisplayName(organization.display_name || organization.name || "");
      setOrgCode(organization.slug || "");
      setMainLogoUrl(organization.main_logo_url || organization.logo_url || null);
      setSubLogoUrl(organization.sub_logo_url || null);
      setAccentColor(organization.accent_color || null);
      // Parse color mappings from JSONB - handle both object and null cases
      const mainColors = organization.main_logo_colors;
      const subColors = organization.sub_logo_colors;
      setMainLogoColors(
        mainColors && typeof mainColors === 'object' && !Array.isArray(mainColors) 
          ? mainColors as Record<string, string> 
          : {}
      );
      setSubLogoColors(
        subColors && typeof subColors === 'object' && !Array.isArray(subColors) 
          ? subColors as Record<string, string> 
          : {}
      );
    }
  }, [organization]);

  // Track changes
  useEffect(() => {
    if (!organization) return;
    
    const originalDisplayName = organization.display_name || organization.name || "";
    const originalCode = organization.slug || "";
    const originalMainLogo = organization.main_logo_url || organization.logo_url || null;
    const originalSubLogo = organization.sub_logo_url || null;
    const originalAccentColor = organization.accent_color || null;
    const originalMainColors = organization.main_logo_colors;
    const originalSubColors = organization.sub_logo_colors;
    
    // Compare color mappings
    const mainColorsChanged = JSON.stringify(mainLogoColors) !== JSON.stringify(
      originalMainColors && typeof originalMainColors === 'object' && !Array.isArray(originalMainColors) 
        ? originalMainColors 
        : {}
    );
    const subColorsChanged = JSON.stringify(subLogoColors) !== JSON.stringify(
      originalSubColors && typeof originalSubColors === 'object' && !Array.isArray(originalSubColors) 
        ? originalSubColors 
        : {}
    );
    
    const changed = 
      displayName !== originalDisplayName ||
      orgCode !== originalCode ||
      mainLogoUrl !== originalMainLogo ||
      subLogoUrl !== originalSubLogo ||
      accentColor !== originalAccentColor ||
      mainColorsChanged ||
      subColorsChanged;
    
    setHasChanges(changed);
  }, [displayName, orgCode, mainLogoUrl, subLogoUrl, accentColor, mainLogoColors, subLogoColors, organization]);

  const handleSaveAll = async () => {
    if (!organization) return;

    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    if (!orgCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an organization code",
        variant: "destructive",
      });
      return;
    }

    // Validate org code format
    const cleanCode = orgCode.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (cleanCode !== orgCode.trim().toLowerCase()) {
      setOrgCode(cleanCode);
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("organizations")
      .update({ 
        display_name: displayName.trim(),
        name: displayName.trim(), // Keep name in sync for backward compatibility
        slug: cleanCode,
        main_logo_url: mainLogoUrl,
        sub_logo_url: subLogoUrl,
        logo_url: mainLogoUrl, // Keep legacy field in sync
        accent_color: accentColor,
        main_logo_colors: mainLogoColors,
        sub_logo_colors: subLogoColors,
      })
      .eq("id", organization.id);

    if (error) {
      setIsSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Refresh organization data to reflect changes immediately
      if (refreshOrganization) {
        await refreshOrganization();
      }
      setIsSaving(false);
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
                  Upload logos to customize your branding. SVG logos support color customization.
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
                mainLogoColors={mainLogoColors}
                subLogoColors={subLogoColors}
                onMainLogoColorsChange={setMainLogoColors}
                onSubLogoColorsChange={setSubLogoColors}
              />
            )}
          </div>


          {/* Accent Color */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Brand Colors</h2>
                <p className="text-sm text-muted-foreground">
                  Customize the accent color used for buttons and highlights
                </p>
              </div>
            </div>

            <AccentColorPicker
              value={accentColor}
              onChange={setAccentColor}
            />
          </div>

          {/* Display Name */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Type className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Company Display Name</h2>
                <p className="text-sm text-muted-foreground">
                  The name shown on your dashboard and throughout the app
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Shell Star Custom Cabinets"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is the full name of your company for display purposes
              </p>
            </div>
          </div>

          {/* Organization Code */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Organization Code</h2>
                <p className="text-sm text-muted-foreground">
                  The unique code employees use to sign in
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="orgCode">Organization Code</Label>
              <Input
                id="orgCode"
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="shellstar"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Employees will enter this code during login. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>
          </div>

          {/* Organization Meta */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Organization Info</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization ID</p>
                  <p className="font-mono text-xs text-foreground">{organization?.id}</p>
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
