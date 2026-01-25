import { GembaDocCell } from "./GembaDocCell";

interface CellData {
  id: string;
  position: number;
  image_url: string | null;
  image_annotations: object[] | null;
  step_number: string | null;
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
  onCellStepNumberChange: (position: number, value: string) => void;
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
  onCellStepNumberChange,
  onCellStepTextChange,
  uploadingPositions,
}: GembaDocGridProps) {
  const totalCells = gridRows * gridCols;

  // Create array of cell positions
  const positions = Array.from({ length: totalCells }, (_, i) => i);

  // Map cells by position
  const cellMap = new Map(cells.map((cell) => [cell.position, cell]));

  return (
    <div
      className="grid gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridRows}, minmax(150px, 1fr))`,
      }}
    >
      {positions.map((position) => {
        const cell = cellMap.get(position);
        return (
          <GembaDocCell
            key={position}
            imageUrl={cell?.image_url || null}
            imageAnnotations={cell?.image_annotations || null}
            stepNumber={cell?.step_number || null}
            stepText={cell?.step_text || null}
            position={position}
            isLocked={isLocked}
            isAdmin={isAdmin}
            onImageUpload={(file) => onCellImageUpload(position, file)}
            onImageDelete={() => onCellImageDelete(position)}
            onAnnotate={() => onCellAnnotate(position)}
            onStepNumberChange={(value) => onCellStepNumberChange(position, value)}
            onStepTextChange={(value) => onCellStepTextChange(position, value)}
            isUploading={uploadingPositions.includes(position)}
          />
        );
      })}
    </div>
  );
}
