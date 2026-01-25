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
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.75rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid hsl(22, 90%, 54%);
          }
          
          .gemba-print-logo {
            height: 48px;
            width: auto;
            flex-shrink: 0;
          }
          
          .gemba-print-header-text {
            flex: 1;
          }
          
          .gemba-print-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0;
            color: #111;
          }
          
          .gemba-print-description {
            font-size: 0.875rem;
            color: #666;
            margin: 0.25rem 0 0;
          }
          
          .gemba-print-grid {
            display: grid;
            gap: 0.375rem;
            flex: 1;
          }
          
          .gemba-print-cell {
            border: 1px solid #e5e5e5;
            border-radius: 0.375rem;
            overflow: hidden;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            background: #fff;
          }
          
          .gemba-print-image-container {
            position: relative;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
            padding: 0.125rem;
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
            object-fit: contain;
            border-radius: 0.25rem;
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
            font-size: 0.625rem;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 0.375rem;
            border-top: 1px solid #eee;
            background: #fafafa;
            min-height: 1.75rem;
          }
          
          .gemba-print-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 0.5rem;
            margin-top: 0.25rem;
          }
          
          .gemba-print-page-number {
            font-size: 0.75rem;
            font-weight: 600;
            color: #fff;
            background: hsl(22, 90%, 54%);
            padding: 0.375rem 1rem;
            border-radius: 1rem;
          }
        `}</style>

        {pages.map((page, pageIndex) => (
          <div key={page.page_number} className="gemba-print-page">
            {/* Header - logo on far left, title next to it */}
            {pageIndex === 0 && (
              <div className="gemba-print-header">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="gemba-print-logo"
                  />
                )}
                <div className="gemba-print-header-text">
                  <h1 className="gemba-print-title">{title}</h1>
                  {description && (
                    <p className="gemba-print-description">{description}</p>
                  )}
                </div>
              </div>
            )}

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
                return (
                  <div key={i} className="gemba-print-cell">
                    {/* Image container with step badge inside */}
                    <div className="gemba-print-image-container">
                      {cell?.step_number && (
                        <div className="gemba-print-step-badge">
                          {cell.step_number}
                        </div>
                      )}
                      {cell?.image_url ? (
                        <img
                          src={cell.image_url}
                          alt={`Step ${cell.step_number || i + 1}`}
                          className="gemba-print-cell-image"
                        />
                      ) : (
                        <div className="gemba-print-empty-image">
                          No image
                        </div>
                      )}
                    </div>
                    {/* Step description below */}
                    <p className="gemba-print-step-text">
                      {cell?.step_text || ""}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer with page number */}
            <div className="gemba-print-footer">
              <span className="gemba-print-page-number">
                Page {page.page_number} of {pages.length}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

GembaDocPrintView.displayName = "GembaDocPrintView";
