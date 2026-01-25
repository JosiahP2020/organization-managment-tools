import { DashboardLayout } from "@/components/DashboardLayout";
import { DocumentSection } from "@/components/training/DocumentSection";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

export type DocumentCategory = "machine_operation" | "machine_maintenance" | "sop_training";

const SOPTraining = () => {
  const { organization } = useAuth();
  
  // Use sub_logo_url for this page
  const subLogoUrl = organization?.sub_logo_url || organization?.logo_url || null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Sub Logo */}
        <div className="flex justify-center">
          <Logo 
            size="lg" 
            customSrc={subLogoUrl} 
            variant="full"
            className="max-h-20"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-primary text-center">
          Training
        </h1>

        <DocumentSection 
          title="Machine Operation"
          category="machine_operation"
        />

        <DocumentSection 
          title="Machine Maintenance"
          category="machine_maintenance"
        />

        <DocumentSection 
          title="SOP and Training"
          category="sop_training"
        />
      </div>
    </DashboardLayout>
  );
};

export default SOPTraining;
