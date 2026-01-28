import { useState } from "react";
import { ArrowLeft, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardStyleShowcase from "@/components/dev/CardStyleShowcase";
import NavItemShowcase from "@/components/dev/NavItemShowcase";
import AddButtonShowcase from "@/components/dev/AddButtonShowcase";
import EditTriggerShowcase from "@/components/dev/EditTriggerShowcase";
import LayoutShowcase from "@/components/dev/LayoutShowcase";

const DesignPreview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cards");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Design Preview</h1>
          </div>
          
          <div className="w-[140px]" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            Browse UI variations and note the numbers of styles you prefer. These are isolated previews that won't affect the main app.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="add-buttons">Add Buttons</TabsTrigger>
            <TabsTrigger value="edit-triggers">Edit Triggers</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-0">
            <CardStyleShowcase />
          </TabsContent>

          <TabsContent value="navigation" className="mt-0">
            <NavItemShowcase />
          </TabsContent>

          <TabsContent value="add-buttons" className="mt-0">
            <AddButtonShowcase />
          </TabsContent>

          <TabsContent value="edit-triggers" className="mt-0">
            <EditTriggerShowcase />
          </TabsContent>

          <TabsContent value="layouts" className="mt-0">
            <LayoutShowcase />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DesignPreview;
