import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/AdminRoute";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Building2, Calendar, Key, Image, Save, Type, Palette, LayoutGrid, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DualLogoUpload } from "@/components/DualLogoUpload";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import type { ThemeColorMappings } from "@/components/SvgColorEditor";
import type { DashboardLayout as DashboardLayoutType, CardStyle } from "@/hooks/useOrganizationSettings";
import {
  LayoutPreviewCard,
  FullWidthPreview,
  GridRightColumnPreview,
  SidebarLeftPreview,
  MasonryPreview,
  LeftAccentCardPreview,
  StatCardPreview,
  CleanMinimalCardPreview,
} from "@/components/admin/LayoutPreviewCard";

// Helper to ensure we have a valid ThemeColorMappings structure
function parseThemeColors(data: unknown): ThemeColorMappings {
  const defaultColors: ThemeColorMappings = { light: {}, dark: {} };
  
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return defaultColors;
  }
  
  const obj = data as Record<string, unknown>;
  
  return {
    light: obj.light && typeof obj.light === 'object' && !Array.isArray(obj.light)
      ? obj.light as Record<string, string>
      : {},
    dark: obj.dark && typeof obj.dark === 'object' && !Array.isArray(obj.dark)
      ? obj.dark as Record<string, string>
      : {},
  };
}

const OrganizationSettings = () => {
  const { organization, refreshOrganization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mainLogoUrl, setMainLogoUrl] = useState<string | null>(null);
  const [subLogoUrl, setSubLogoUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [mainLogoColors, setMainLogoColors] = useState<ThemeColorMappings>({ light: {}, dark: {} });
  const [subLogoColors, setSubLogoColors] = useState<ThemeColorMappings>({ light: {}, dark: {} });
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayoutType>('grid-right-column');
  const [cardStyle, setCardStyle] = useState<CardStyle>('left-accent');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize state from organization data
  useEffect(() => {
    if (organization) {
      setDisplayName(organization.display_name || organization.name || "");
      setOrgCode(organization.slug || "");
      setMainLogoUrl(organization.main_logo_url || organization.logo_url || null);
      setSubLogoUrl(organization.sub_logo_url || null);
      setAccentColor(organization.accent_color || null);
      // Parse color mappings with theme structure
      setMainLogoColors(parseThemeColors(organization.main_logo_colors));
      setSubLogoColors(parseThemeColors(organization.sub_logo_colors));
      // Layout settings - cast from unknown since types.ts doesn't have these yet
      const org = organization as typeof organization & { dashboard_layout?: string; card_style?: string };
      setDashboardLayout((org.dashboard_layout || 'grid-right-column') as DashboardLayoutType);
      setCardStyle((org.card_style || 'left-accent') as CardStyle);
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
    const originalMainColors = parseThemeColors(organization.main_logo_colors);
    const originalSubColors = parseThemeColors(organization.sub_logo_colors);
    const org = organization as typeof organization & { dashboard_layout?: string; card_style?: string };
    const originalLayout = org.dashboard_layout || 'grid-right-column';
    const originalCardStyle = org.card_style || 'left-accent';
    
    // Compare color mappings
    const mainColorsChanged = JSON.stringify(mainLogoColors) !== JSON.stringify(originalMainColors);
    const subColorsChanged = JSON.stringify(subLogoColors) !== JSON.stringify(originalSubColors);
    
    const changed = 
      displayName !== originalDisplayName ||
      orgCode !== originalCode ||
      mainLogoUrl !== originalMainLogo ||
      subLogoUrl !== originalSubLogo ||
      accentColor !== originalAccentColor ||
      mainColorsChanged ||
      subColorsChanged ||
      dashboardLayout !== originalLayout ||
      cardStyle !== originalCardStyle;
    
    setHasChanges(changed);
  }, [displayName, orgCode, mainLogoUrl, subLogoUrl, accentColor, mainLogoColors, subLogoColors, dashboardLayout, cardStyle, organization]);

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
        main_logo_colors: mainLogoColors as unknown as Json,
        sub_logo_colors: subLogoColors as unknown as Json,
        dashboard_layout: dashboardLayout,
        card_style: cardStyle,
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
                  Upload logos to customize your branding. SVG logos support color customization for light and dark modes.
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

          {/* Dashboard Layout */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Dashboard Layout</h2>
                <p className="text-sm text-muted-foreground">
                  Choose how categories are displayed on the dashboard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <LayoutPreviewCard
                title="Full Width"
                description="Single column, stacked cards"
                selected={dashboardLayout === 'full-width'}
                onClick={() => setDashboardLayout('full-width')}
              >
                <FullWidthPreview />
              </LayoutPreviewCard>
              
              <LayoutPreviewCard
                title="Grid + Widgets"
                description="Grid with right widget column"
                selected={dashboardLayout === 'grid-right-column'}
                onClick={() => setDashboardLayout('grid-right-column')}
              >
                <GridRightColumnPreview />
              </LayoutPreviewCard>
              
              <LayoutPreviewCard
                title="Sidebar Left"
                description="Navigation sidebar with grid"
                selected={dashboardLayout === 'sidebar-left'}
                onClick={() => setDashboardLayout('sidebar-left')}
              >
                <SidebarLeftPreview />
              </LayoutPreviewCard>
              
              <LayoutPreviewCard
                title="Masonry"
                description="Pinterest-style varied heights"
                selected={dashboardLayout === 'masonry'}
                onClick={() => setDashboardLayout('masonry')}
              >
                <MasonryPreview />
              </LayoutPreviewCard>
            </div>
          </div>

          {/* Card Style */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Card Style</h2>
                <p className="text-sm text-muted-foreground">
                  Choose the visual style for category cards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <LayoutPreviewCard
                title="Left Accent"
                description="Accent bar on left"
                selected={cardStyle === 'left-accent'}
                onClick={() => setCardStyle('left-accent')}
              >
                <LeftAccentCardPreview />
              </LayoutPreviewCard>
              
              <LayoutPreviewCard
                title="Stat Card"
                description="Centered icon & text"
                selected={cardStyle === 'stat-card'}
                onClick={() => setCardStyle('stat-card')}
              >
                <StatCardPreview />
              </LayoutPreviewCard>
              
              <LayoutPreviewCard
                title="Clean Minimal"
                description="Simple horizontal layout"
                selected={cardStyle === 'clean-minimal'}
                onClick={() => setCardStyle('clean-minimal')}
              >
                <CleanMinimalCardPreview />
              </LayoutPreviewCard>
            </div>
          </div>
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
