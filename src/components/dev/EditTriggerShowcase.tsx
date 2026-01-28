import { useState } from "react";
import { Pencil, Settings, Menu, Lock, LockOpen, Unlock, LayoutGrid, GripVertical, PencilOff, Edit2, ShieldCheck, ShieldOff } from "lucide-react";
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

        {/* 9. Circular Lock Button (Large) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">9. Circular Lock Button (Large)</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(9)}
                  className={`h-14 w-14 rounded-full shadow-md flex items-center justify-center transition-all ${
                    activeStates[9] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[9] ? <LockOpen className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[9] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 10. Circular Pencil Button (Large) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">10. Circular Pencil Button (Large)</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(10)}
                  className={`h-14 w-14 rounded-full shadow-md flex items-center justify-center transition-all ${
                    activeStates[10] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[10] ? <PencilOff className="h-6 w-6" /> : <Pencil className="h-6 w-6" />}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[10] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 11. Lock + Pencil Combo (Stacked) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">11. Lock + Pencil Combo Button</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(11)}
                  className={`h-14 w-14 rounded-full shadow-md flex flex-col items-center justify-center gap-0.5 transition-all ${
                    activeStates[11] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[11] ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <Pencil className="h-4 w-4" />
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[11] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 12. Pill Button with Lock + Text */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">12. Pill Button with Lock + Text</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(12)}
                  className={`h-10 px-4 rounded-full shadow-md flex items-center gap-2 transition-all text-sm font-medium ${
                    activeStates[12] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[12] ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {activeStates[12] ? "Editing" : "Locked"}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[12] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 13. Pill Button with Pencil + Text */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">13. Pill Button with Pencil + Text</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(13)}
                  className={`h-10 px-4 rounded-full shadow-md flex items-center gap-2 transition-all text-sm font-medium ${
                    activeStates[13] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[13] ? <PencilOff className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {activeStates[13] ? "Exit Edit" : "Edit"}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[13] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 14. Shield Icon (Protection Theme) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">14. Shield Icon (Protection Theme)</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(14)}
                  className={`h-14 w-14 rounded-full shadow-md flex items-center justify-center transition-all ${
                    activeStates[14] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[14] ? <ShieldOff className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[14] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 15. Square Button Lock */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">15. Square Button with Lock</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(15)}
                  className={`h-14 w-14 rounded-lg shadow-md flex items-center justify-center transition-all ${
                    activeStates[15] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[15] ? <LockOpen className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-lg">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[15] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>

        {/* 16. Square Button Pencil */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">16. Square Button with Pencil</span>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
              <span className="font-semibold">Dashboard</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggle(16)}
                  className={`h-14 w-14 rounded-lg shadow-md flex items-center justify-center transition-all ${
                    activeStates[16] 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background border border-border hover:bg-accent"
                  }`}
                >
                  {activeStates[16] ? <PencilOff className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
                </button>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-lg">
                  <Settings className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4 text-center text-sm text-muted-foreground">
              {activeStates[16] ? "Edit Mode: ON" : "Edit Mode: OFF"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTriggerShowcase;
