import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useThemeLogos } from "@/hooks/useThemeLogos";

const PipeDrawer = () => {
  const { subLogoUrl } = useThemeLogos();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header with logo */}
        <div className="flex justify-center mb-6 md:mb-8">
          <Logo 
            size="lg" 
            customSrc={subLogoUrl} 
            variant="full"
            className="max-h-20 md:max-h-24"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Pipe Drawer Measurement
          </h1>
          <p className="text-muted-foreground mt-1">
            Record and manage pipe drawer measurements for projects.
          </p>
        </div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This feature is currently in development. Check back soon for pipe drawer measurement tools.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PipeDrawer;
