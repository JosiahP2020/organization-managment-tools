import { forwardRef } from "react";

interface CellData {
  position: number;
  image_url: string | null;
  image_annotations: object[] | null;
  step_number: string | null;
  step_text: string | null;
}

interface PageData {
  page_number: number;
  cells: CellData[];
}

interface GembaDocPrintViewProps {
  title: string;
  description: string | null;
  logoUrl: string | null;
  pages: PageData[];
  gridRows: number;
  gridCols: number;
  orientation: "portrait" | "landscape";
}

export const GembaDocPrintView = forwardRef<HTMLDivElement, GembaDocPrintViewProps>(
  ({ title, description, logoUrl, pages, gridRows, gridCols, orientation }, ref) => {
    return (
      <div ref={ref} className="gemba-print-view">
        <style>{`
          @media print {
            @page {
              size: ${orientation === "landscape" ? "landscape" : "portrait"};
              margin: 0.4in;
            }
            
            body * {
              visibility: hidden;
            }
            
            .gemba-print-view,
            .gemba-print-view * {
              visibility: visible;
            }
            
            .gemba-print-view {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            
            .gemba-print-page {
              page-break-after: always;
              page-break-inside: avoid;
              height: 100vh;
              box-sizing: border-box;
            }
            
            .gemba-print-page:last-child {
              page-break-after: auto;
            }
          }
          
          .gemba-print-view {
            background: white;
            color: #1a1a1a;
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .gemba-print-page {
            padding: 0.375rem;
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          
          .gemba-print-header {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
            padding-bottom: 0.25rem;
            min-height: 64px;
          }
          
          .gemba-print-page-number {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: hsl(22, 90%, 54%);
            background: hsl(22, 90%, 54%, 0.15);
            border-radius: 0.5rem;
            padding: 0.25rem 0.5rem;
            min-width: 2rem;
            text-align: center;
          }
          
          .gemba-print-logo {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 64px;
            width: auto;
          }
          
          .gemba-print-header-text {
            text-align: center;
          }
          
          .gemba-print-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
            color: #111;
          }
          
          .gemba-print-description {
            font-size: 1rem;
            color: #666;
            margin: 0.375rem 0 0;
          }
          
          .gemba-print-grid {
            display: grid;
            gap: 0.375rem;
            flex: 1;
            min-height: 0;
          }
          
          .gemba-print-cell {
            position: relative;
            overflow: hidden;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            border-radius: 0.5rem;
          }
          
          .gemba-print-cell-empty {
            background: transparent;
          }
          
          .gemba-print-image-container {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border-radius: 0.5rem;
          }
          
          .gemba-print-step-badge {
            position: absolute;
            top: 0.5rem;
            left: 0.5rem;
            background: hsl(22, 90%, 54%);
            color: #fff;
            min-width: 2rem;
            height: 2rem;
            padding: 0 0.5rem;
            font-weight: 700;
            font-size: 0.875rem;
            border-radius: 0.375rem;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }
          
          .gemba-print-cell-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.5rem;
          }
          
          .gemba-print-empty-image {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ccc;
            font-size: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .gemba-print-step-text {
            font-family: Inter, system-ui, sans-serif;
            font-size: 0.8rem;
            font-weight: 600;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0.25rem 0.375rem;
            min-height: 1.5rem;
          }
        `}</style>

        {pages.map((page, pageIndex) => (
          <div key={page.page_number} className="gemba-print-page">
            {/* Header - logo on far left, page number on far right, title centered */}
            <div className="gemba-print-header">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="gemba-print-logo"
                />
              )}
              {pageIndex === 0 && (
                <div className="gemba-print-header-text">
                  <h1 className="gemba-print-title">{title}</h1>
                  {description && (
                    <p className="gemba-print-description">{description}</p>
                  )}
                </div>
              )}
              <span className="gemba-print-page-number">
                {page.page_number}
              </span>
            </div>

            {/* Grid */}
            <div
              className="gemba-print-grid"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
              }}
            >
              {Array.from({ length: gridRows * gridCols }, (_, i) => {
                const cell = page.cells.find((c) => c.position === i);
                // Calculate step number from position (1-indexed), just like the main grid
                const stepNumber = i + 1;
                const hasImage = !!cell?.image_url;
                
                // If no image, render empty/invisible cell
                if (!hasImage) {
                  return (
                    <div key={i} className="gemba-print-cell gemba-print-cell-empty">
                    </div>
                  );
                }
                
                return (
                  <div key={i} className="gemba-print-cell">
                    {/* Image container with step badge inside */}
                    <div className="gemba-print-image-container">
                      <div className="gemba-print-step-badge">
                        {stepNumber}
                      </div>
                      <img
                        src={cell.image_url}
                        alt={`Step ${stepNumber}`}
                        className="gemba-print-cell-image"
                      />
                    </div>
                    {/* Step description below */}
                    <p className="gemba-print-step-text">
                      {cell?.step_text || ""}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>
    );
  }
);

GembaDocPrintView.displayName = "GembaDocPrintView";
