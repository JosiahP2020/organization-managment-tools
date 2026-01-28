import { Wrench, BookOpen, FolderOpen, Bell, Star, Clock, FileText } from "lucide-react";

const LayoutShowcase = () => {
  // Mini card component for layouts
  const MiniCard = ({ label }: { label: string }) => (
    <div className="bg-muted rounded p-2 text-xs text-center truncate">{label}</div>
  );

  // Mini widget component for layouts
  const MiniWidget = ({ label }: { label: string }) => (
    <div className="bg-primary/10 border border-primary/20 rounded p-2 text-xs text-center truncate">{label}</div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Dashboard Layout Options</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select how the dashboard should be arranged, including where widgets appear (if at all).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 1. Full Width Grid (Current) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">1. Full Width Grid (Current)</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full grid grid-cols-3 gap-2">
              <MiniCard label="Training" />
              <MiniCard label="Shop" />
              <MiniCard label="Install" />
              <MiniCard label="Safety" />
              <MiniCard label="HR" />
              <MiniCard label="Reports" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Menus fill entire width, no widget area.</p>
        </div>

        {/* 2. Grid + Right Widget Column */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">2. Grid + Right Widget Column</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex gap-3">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
                <MiniCard label="Safety" />
              </div>
              <div className="w-24 flex flex-col gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Quick Links" />
                <MiniWidget label="Recent" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Widgets in a fixed right column.</p>
        </div>

        {/* 3. Grid + Left Widget Column */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">3. Grid + Left Widget Column</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex gap-3">
              <div className="w-24 flex flex-col gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Quick Links" />
                <MiniWidget label="Recent" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
                <MiniCard label="Safety" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Widgets in a fixed left column.</p>
        </div>

        {/* 4. Top Widgets + Grid */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">4. Top Widgets + Grid</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex flex-col gap-3">
              <div className="flex gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Quick Links" />
                <MiniWidget label="Activity" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
                <MiniCard label="Safety" />
                <MiniCard label="HR" />
                <MiniCard label="Reports" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Widget row above menu grid.</p>
        </div>

        {/* 5. Bottom Widgets */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">5. Bottom Widgets</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex flex-col gap-3">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
                <MiniCard label="Safety" />
                <MiniCard label="HR" />
                <MiniCard label="Reports" />
              </div>
              <div className="flex gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Quick Links" />
                <MiniWidget label="Activity" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Widget row below menu grid.</p>
        </div>

        {/* 6. Corner Widgets (Top Right) */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">6. Corner Widgets (Top Right)</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full grid grid-cols-3 grid-rows-3 gap-2">
              <MiniCard label="Training" />
              <MiniCard label="Shop" />
              <div className="row-span-2 flex flex-col gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Links" />
              </div>
              <MiniCard label="Install" />
              <MiniCard label="Safety" />
              <MiniCard label="HR" />
              <MiniCard label="Reports" />
              <MiniCard label="Docs" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Widgets occupy top-right corner area.</p>
        </div>

        {/* 7. Two Column Split */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">7. Two Column Split (50/50)</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">Menus</div>
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">Widgets</div>
                <MiniWidget label="Alerts" />
                <MiniWidget label="Quick Links" />
                <MiniWidget label="Recent" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Equal split between menus and widgets.</p>
        </div>

        {/* 8. Masonry Style */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">8. Mixed Masonry</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full grid grid-cols-3 gap-2">
              <MiniCard label="Training" />
              <MiniWidget label="Alerts" />
              <MiniCard label="Shop" />
              <MiniCard label="Install" />
              <MiniCard label="Safety" />
              <MiniWidget label="Links" />
              <MiniWidget label="Recent" />
              <MiniCard label="HR" />
              <MiniCard label="Reports" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Menus and widgets intermixed freely.</p>
        </div>

        {/* 9. Stacked Rows */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground">9. Stacked Rows</span>
          <div className="bg-card border border-border rounded-lg p-4 aspect-[4/3]">
            <div className="h-full flex flex-col gap-2">
              <div className="flex gap-2">
                <MiniCard label="Training" />
                <MiniCard label="Shop" />
                <MiniCard label="Install" />
              </div>
              <div className="flex gap-2">
                <MiniWidget label="Alerts" />
                <MiniWidget label="Links" />
              </div>
              <div className="flex gap-2">
                <MiniCard label="Safety" />
                <MiniCard label="HR" />
                <MiniCard label="Reports" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Alternating rows of menus and widgets.</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2">Layout Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Blue boxes</strong> = Menu/Category cards (Training, Shop, etc.)</li>
          <li>• <strong>Primary-tinted boxes</strong> = Widgets (Alerts, Quick Links, etc.)</li>
          <li>• All layouts are fully responsive and adapt to mobile</li>
          <li>• Widget positions can be configured per-organization</li>
        </ul>
      </div>
    </div>
  );
};

export default LayoutShowcase;
