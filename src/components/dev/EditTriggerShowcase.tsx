import { useState } from "react";
import { Pencil, Settings, Menu, Lock, Unlock, LayoutGrid, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const EditTriggerShowcase = () => {
  const [activeStates, setActiveStates] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => {
    setActiveStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Edit Mode Trigger Styles & Placements</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select where and how the global "Edit Mode" toggle should appear for admins. Click each to see both states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Header Bar Right */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">1. Header Bar Right (next to Settings)</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Mock Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant={activeStates[1] ? "default" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => toggle(1)}
                >
                  <Pencil className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[1] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 2. Header Bar Left */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">2. Header Bar Left (next to Menu)</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
                <Button 
                  variant={activeStates[2] ? "default" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => toggle(2)}
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </div>
              <span className="font-semibold">Dashboard</span>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[2] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 3. Floating Bottom Right */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">3. Floating Bottom Right</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden relative h-48">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[3] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
            <button 
              onClick={() => toggle(3)}
              className={`absolute bottom-4 right-4 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
                activeStates[3] 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border border-border hover:border-primary"
              }`}
            >
              <Pencil className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 4. Floating Bottom Left */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">4. Floating Bottom Left</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden relative h-48">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[4] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
            <button 
              onClick={() => toggle(4)}
              className={`absolute bottom-4 left-4 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
                activeStates[4] 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border border-border hover:border-primary"
              }`}
            >
              <Pencil className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 5. Top Right Badge */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">5. Top Right Badge Toggle</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={activeStates[5] ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggle(5)}
                >
                  {activeStates[5] ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {activeStates[5] ? "Editing" : "Locked"}
                </Badge>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[5] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 6. Switch Toggle in Header */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">6. Switch Toggle in Header</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Pencil className={`h-4 w-4 ${activeStates[6] ? "text-primary" : "text-muted-foreground"}`} />
                  <Switch 
                    checked={activeStates[6] || false} 
                    onCheckedChange={() => toggle(6)} 
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[6] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 7. Layout Grid Icon */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">7. Layout/Grid Icon</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant={activeStates[7] ? "default" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => toggle(7)}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[7] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 8. Grip/Drag Icon */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">8. Grip/Drag Icon</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant={activeStates[8] ? "default" : "ghost"} 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => toggle(8)}
                >
                  <GripVertical className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[8] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTriggerShowcase;
