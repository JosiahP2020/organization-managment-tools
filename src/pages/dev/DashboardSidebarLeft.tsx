import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeftAccentCard, StatCard, CleanMinimalCard } from "@/components/dashboard/CategoryCardVariants";
import { AddMenuCardButton } from "@/components/dashboard/AddMenuCardButton";
import { SidebarWidgets } from "@/components/dashboard/WidgetPlaceholder";
import type { CardStyle } from "@/hooks/useOrganizationSettings";

// Mock categories for testing
const mockCategories = [
  { id: "1", name: "Training", description: "Employee training materials", icon: "book-open", show_on_dashboard: true, show_in_sidebar: true, sort_order: 0, parent_category_id: null, organization_id: "mock-org" },
  { id: "2", name: "Shop Install", description: "Installation projects", icon: "wrench", show_on_dashboard: true, show_in_sidebar: true, sort_order: 1, parent_category_id: null, organization_id: "mock-org" },
  { id: "3", name: "Maintenance", description: "Equipment maintenance logs", icon: "settings", show_on_dashboard: true, show_in_sidebar: true, sort_order: 2, parent_category_id: null, organization_id: "mock-org" },
  { id: "4", name: "Safety", description: "Safety protocols and guidelines", icon: "shield", show_on_dashboard: true, show_in_sidebar: true, sort_order: 3, parent_category_id: null, organization_id: "mock-org" },
  { id: "5", name: "Reports", description: "Analytics and reports", icon: "bar-chart-3", show_on_dashboard: true, show_in_sidebar: true, sort_order: 4, parent_category_id: null, organization_id: "mock-org" },
];

const cardStyles: { value: CardStyle; label: string }[] = [
  { value: "left-accent", label: "Left Accent" },
  { value: "stat-card", label: "Stat Card" },
  { value: "clean-minimal", label: "Clean Minimal" },
];

export default function DashboardSidebarLeft() {
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
        <h1 className="text-2xl font-bold text-foreground">Dev: Sidebar Left Layout</h1>
        <p className="text-muted-foreground">Testing all card styles with real widgets on the left</p>
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

      {/* Sidebar Left Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left Sidebar - Real Widgets */}
        <div className="hidden lg:block">
          <SidebarWidgets />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockCategories.map((category) => (
            <CardComponent
              key={category.id}
              category={category}
              onClick={() => console.log("Clicked:", category.name)}
              showEditButton={true}
              onEditClick={(e) => {
                e.stopPropagation();
                console.log("Edit:", category.name);
              }}
            />
          ))}
          
          {/* Add Menu Button */}
          <div className="flex justify-center h-16 md:h-20 items-center">
            <AddMenuCardButton onAddMenu={() => console.log("Add menu")} />
          </div>
        </div>
      </div>
    </div>
  );
}
