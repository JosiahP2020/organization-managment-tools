import { GembaDocCell } from "./GembaDocCell";

interface CellData {
  id: string;
  position: number;
  image_url: string | null;
  image_annotations: object[] | null;
  step_text: string | null;
}

interface GembaDocGridProps {
  cells: CellData[];
  gridRows: number;
  gridCols: number;
  isLocked: boolean;
  isAdmin: boolean;
  onCellImageUpload: (position: number, file: File) => void;
  onCellImageDelete: (position: number) => void;
  onCellAnnotate: (position: number) => void;
  onCellStepTextChange: (position: number, value: string) => void;
  uploadingPositions: number[];
}

export function GembaDocGrid({
  cells,
  gridRows,
  gridCols,
  isLocked,
  isAdmin,
  onCellImageUpload,
  onCellImageDelete,
  onCellAnnotate,
  onCellStepTextChange,
  uploadingPositions,
}: GembaDocGridProps) {
  const totalCells = gridRows * gridCols;

  // Create array of cell positions
  const positions = Array.from({ length: totalCells }, (_, i) => i);

  // Map cells by position
  const cellMap = new Map(cells.map((cell) => [cell.position, cell]));

  return (
    <div className="relative p-6">
      {/* Print outline overlay */}
      <div className="absolute inset-4 border-2 border-dashed border-primary/40 rounded-lg pointer-events-none z-10">
        <span className="absolute -top-3 left-4 bg-background px-2 text-xs font-medium text-primary">
          Print Area
        </span>
        {/* Corner markers */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary rounded-tl" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary rounded-tr" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary rounded-bl" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary rounded-br" />
      </div>
      
      <div
        className="grid gap-4 p-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(150px, 1fr))`,
        }}
      >
        {positions.map((position) => {
          const cell = cellMap.get(position);
          const stepNumber = position + 1;
          return (
            <GembaDocCell
              key={position}
              imageUrl={cell?.image_url || null}
              imageAnnotations={cell?.image_annotations || null}
              stepNumber={stepNumber}
              stepText={cell?.step_text || null}
              position={position}
              isLocked={isLocked}
              isAdmin={isAdmin}
              onImageUpload={(file) => onCellImageUpload(position, file)}
              onImageDelete={() => onCellImageDelete(position)}
              onAnnotate={() => onCellAnnotate(position)}
              onStepTextChange={(value) => onCellStepTextChange(position, value)}
              isUploading={uploadingPositions.includes(position)}
            />
          );
        })}
      </div>
    </div>
  );
}
