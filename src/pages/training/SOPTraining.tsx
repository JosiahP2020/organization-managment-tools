import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DocumentSection } from "@/components/training/DocumentSection";
import { BackButton } from "@/components/BackButton";

export type DocumentCategory = "machine_operation" | "machine_maintenance" | "sop_training";

const SOPTraining = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            SOP/Training
          </h1>
        </div>

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
