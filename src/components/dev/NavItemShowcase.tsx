import { Wrench, FolderOpen, BookOpen, ClipboardList, Home, Settings, ChevronRight } from "lucide-react";

const NavItemShowcase = () => {
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Wrench, label: "Shop & Install", active: false },
    { icon: BookOpen, label: "Training", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Navigation Item Styles</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select a style for sidebar and menu navigation items. The first item in each group shows the "active" state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Current Style */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">1. Current Style (Rounded)</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  item.active ? "bg-accent text-primary" : "hover:bg-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Sharp Corner */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">2. Sharp Corner</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-none cursor-pointer transition-colors ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Rounded Pill */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">3. Rounded Pill</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-colors mb-1 ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Underline Hover */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">4. Underline Hover</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all border-b-2 ${
                  item.active ? "border-b-primary text-primary" : "border-b-transparent hover:border-b-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Left Border Accent */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">5. Left Border Accent</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-l-3 ${
                  item.active ? "border-l-primary bg-accent/50 text-primary" : "border-l-transparent hover:bg-accent/30"
                }`}
                style={{ borderLeftWidth: "3px" }}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Background Only */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">6. Background Only</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                  item.active ? "bg-primary/15 text-primary font-semibold" : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Icon Forward */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">7. Icon Forward</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors rounded-lg ${
                  item.active ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className={`text-sm ${item.active ? "font-semibold" : ""}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Full Width List */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">8. Full Width List</span>
          <div className="bg-card border border-border rounded-lg w-64 overflow-hidden">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                  item.active ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* 9. Compact Grid */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">9. Compact Grid</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg cursor-pointer transition-colors ${
                    item.active ? "bg-primary text-primary-foreground" : "bg-accent/30 hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 10. Tab Style */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">10. Tab Style</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            <div className="flex flex-wrap gap-1">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors ${
                    item.active 
                      ? "bg-background border border-border border-b-0 -mb-px relative z-10" 
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-3 w-3" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border" />
          </div>
        </div>

        {/* 11. Minimal with Dot */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">11. Minimal with Dot</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-accent/30"
              >
                {item.active && <div className="h-2 w-2 rounded-full bg-primary" />}
                <item.icon className={`h-4 w-4 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm ${item.active ? "text-primary font-medium" : "text-foreground"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 12. Gradient Active */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">12. Gradient Active</span>
          <div className="bg-card border border-border rounded-lg p-3 w-64">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  item.active 
                    ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-md" 
                    : "hover:bg-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavItemShowcase;
