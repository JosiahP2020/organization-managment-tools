import { Wrench, FolderOpen, BookOpen, ClipboardList } from "lucide-react";

const CardStyleShowcase = () => {
  const sampleIcon = Wrench;
  const sampleTitle = "Shop & Install";
  const sampleDescription = "Manage projects and installations";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Dashboard Card Styles</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select a card style for menu items on the dashboard. Each variation shows how "Shop & Install" would appear.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Current Style */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">1. Current Style</span>
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 2. Clean Minimal */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">2. Clean Minimal</span>
          <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 3. Left Accent Bar */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">3. Left Accent Bar</span>
          <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 border-l-4 border-l-primary">
            <Wrench className="h-6 w-6 text-primary" />
            <h3 className="font-medium">{sampleTitle}</h3>
          </div>
        </div>

        {/* 4. Icon Badge */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">4. Icon Badge</span>
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-medium">{sampleTitle}</h3>
              <p className="text-xs text-muted-foreground">4 items</p>
            </div>
          </div>
        </div>

        {/* 5. Tile Grid (Square) */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">5. Tile Grid (Square)</span>
          <div className="bg-card border border-border rounded-2xl aspect-square p-4 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-medium text-sm text-center">{sampleTitle}</h3>
          </div>
        </div>

        {/* 6. List Row */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">6. List Row</span>
          <div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-all cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">{sampleTitle}</h3>
                <p className="text-xs text-muted-foreground">{sampleDescription}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </div>
        </div>

        {/* 7. Stat Card */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">7. Stat Card</span>
          <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <Wrench className="h-6 w-6 text-primary" />
              <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">12 items</span>
            </div>
            <h3 className="font-semibold">{sampleTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1">Last updated 2h ago</p>
          </div>
        </div>

        {/* 8. Sharp Corners */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">8. Sharp Corners</span>
          <div className="bg-card border border-border rounded-none p-6 shadow-md hover:shadow-lg transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              <h3 className="font-semibold uppercase tracking-wide text-sm">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 9. Borderless Hover */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">9. Borderless Hover</span>
          <div className="bg-transparent hover:bg-card p-6 rounded-lg hover:shadow-lg hover:border hover:border-border transition-all cursor-pointer border border-transparent">
            <div className="flex flex-col items-center text-center gap-3">
              <Wrench className="h-7 w-7 text-primary" />
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 10. Underline Accent */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">10. Underline Accent</span>
          <div className="bg-card border border-border rounded-lg p-5 hover:border-b-primary hover:border-b-2 transition-all cursor-pointer group">
            <div className="flex flex-col items-center text-center gap-2">
              <Wrench className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 11. Thin Border */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">11. Thin Border</span>
          <div className="bg-card border border-border/50 rounded-md p-5 hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-normal text-sm">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 12. Gradient Accent */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">12. Gradient Accent</span>
          <div className="relative bg-card rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
            <div className="relative flex flex-col items-center text-center gap-3">
              <Wrench className="h-7 w-7 text-primary" />
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 13. Compact Horizontal */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">13. Compact Horizontal</span>
          <div className="bg-card border border-border rounded-full px-5 py-3 hover:bg-accent/50 transition-all cursor-pointer inline-flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">{sampleTitle}</h3>
          </div>
        </div>

        {/* 14. Two-Tone */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">14. Two-Tone</span>
          <div className="rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-border">
            <div className="bg-primary/10 p-4 flex justify-center">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <div className="bg-card p-4 text-center">
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 15. Glass Morphism */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">15. Glass Morphism</span>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-6 hover:bg-card/90 transition-all cursor-pointer">
              <div className="flex flex-col items-center text-center gap-3">
                <Wrench className="h-7 w-7 text-primary" />
                <h3 className="font-medium">{sampleTitle}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* 16. Outlined Icon */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">16. Outlined Icon</span>
          <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 17. Floating Card */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">17. Floating Card</span>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <Wrench className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">{sampleTitle}</h3>
            </div>
          </div>
        </div>

        {/* 18. Subtle Gradient BG */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">18. Subtle Gradient BG</span>
          <div className="bg-gradient-to-br from-card to-accent/30 border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <Wrench className="h-7 w-7 text-primary" />
              <h3 className="font-medium">{sampleTitle}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardStyleShowcase;
