import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import type { MoveTarget } from "./SelectionProvider";

interface Props {
  open: boolean;
  mode: "move" | "copy";
  count: number;
  loadTargets: () => Promise<MoveTarget[]> | MoveTarget[];
  onCancel: () => void;
  onConfirm: (target: MoveTarget) => Promise<void> | void;
}

export function MoveCopyDialog({ open, mode, count, loadTargets, onCancel, onConfirm }: Props) {
  const [targets, setTargets] = useState<MoveTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<MoveTarget | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPicked(null);
    setLoading(true);
    Promise.resolve(loadTargets())
      .then((t) => setTargets(t))
      .finally(() => setLoading(false));
  }, [open, loadTargets]);

  const filtered = targets.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase()) ||
    (t.group ?? "").toLowerCase().includes(query.toLowerCase())
  );

  // Group by group key
  const grouped = filtered.reduce<Record<string, MoveTarget[]>>((acc, t) => {
    const key = t.group ?? "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "move" ? "Move" : "Copy"} {count} item{count === 1 ? "" : "s"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-72 -mx-2">
          <div className="px-2">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No destinations available</p>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-3">
                  {group && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
                      {group}
                    </p>
                  )}
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setPicked(t)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        picked?.id === t.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            disabled={!picked || submitting}
            onClick={async () => {
              if (!picked) return;
              setSubmitting(true);
              try {
                await onConfirm(picked);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === "move" ? "Move here" : "Copy here"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
