import { DashboardLayout } from "@/components/DashboardLayout";
import { DocumentSection } from "@/components/training/DocumentSection";

export type DocumentCategory = "machine_operation" | "machine_maintenance" | "sop_training";

const SOPTraining = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center">
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
