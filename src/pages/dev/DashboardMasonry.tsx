import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "@/components/dashboard/CategoryCardVariants";
import { AddMenuCardButton } from "@/components/dashboard/AddMenuCardButton";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

// Mock categories for testing
const mockCategories = [
  { id: "1", name: "Training", description: "Employee training materials", icon: "book-open", show_on_dashboard: true, show_in_sidebar: true, sort_order: 0, parent_category_id: null, organization_id: "mock-org" },
  { id: "2", name: "Shop Install", description: "Installation projects", icon: "wrench", show_on_dashboard: true, show_in_sidebar: true, sort_order: 1, parent_category_id: null, organization_id: "mock-org" },
  { id: "3", name: "Maintenance", description: "Equipment maintenance logs", icon: "settings", show_on_dashboard: true, show_in_sidebar: true, sort_order: 2, parent_category_id: null, organization_id: "mock-org" },
  { id: "4", name: "Safety", description: "Safety protocols and guidelines", icon: "shield", show_on_dashboard: true, show_in_sidebar: true, sort_order: 3, parent_category_id: null, organization_id: "mock-org" },
  { id: "5", name: "Reports", description: "Analytics and reports", icon: "bar-chart-3", show_on_dashboard: true, show_in_sidebar: true, sort_order: 4, parent_category_id: null, organization_id: "mock-org" },
  { id: "6", name: "Inventory", description: "Stock and supplies tracking", icon: "package", show_on_dashboard: true, show_in_sidebar: true, sort_order: 5, parent_category_id: null, organization_id: "mock-org" },
];

const cardStyles: { value: CardStyle; label: string }[] = [
  { value: "left-accent", label: "Left Accent" },
  { value: "stat-card", label: "Stat Card" },
  { value: "clean-minimal", label: "Clean Minimal" },
];

export default function DashboardMasonry() {
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>("left-accent");

  const CardComponent = selectedStyle === "stat-card" 
    ? StatCard 
    : selectedStyle === "clean-minimal" 
      ? CleanMinimalCard 
      : LeftAccentCard;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dev: Masonry Layout</h1>
        <p className="text-muted-foreground">Testing all card styles in a Pinterest-style masonry grid</p>
      </div>

      {/* Style Toggle */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {cardStyles.map((style) => (
            <Button
              key={style.value}
              variant={selectedStyle === style.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStyle(style.value)}
            >
              {style.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Masonry Layout - CSS Columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {mockCategories.map((category) => (
          <div key={category.id} className="break-inside-avoid">
            <CardComponent
              category={category}
              onClick={() => console.log("Clicked:", category.name)}
              showEditButton={true}
              onEditClick={(e) => {
                e.stopPropagation();
                console.log("Edit:", category.name);
              }}
            />
          </div>
        ))}
        
        {/* Add Menu Button */}
        <div className="break-inside-avoid flex justify-center h-16 items-center">
          <AddMenuCardButton onAddMenu={() => console.log("Add menu")} />
        </div>
      </div>
    </div>
  );
}
