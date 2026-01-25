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
              margin: 0.5in;
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
            color: black;
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .gemba-print-page {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          
          .gemba-print-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 3px solid hsl(22, 90%, 54%);
          }
          
          .gemba-print-logo {
            max-height: 50px;
            width: auto;
            flex-shrink: 0;
          }
          
          .gemba-print-header-text {
            flex: 1;
          }
          
          .gemba-print-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
            color: #111;
          }
          
          .gemba-print-description {
            font-size: 0.875rem;
            color: #555;
            margin: 0.25rem 0 0;
          }
          
          .gemba-print-grid {
            display: grid;
            gap: 0.75rem;
            flex: 1;
          }
          
          .gemba-print-cell {
            border: 1px solid #e0e0e0;
            border-radius: 0.5rem;
            padding: 0.5rem;
            break-inside: avoid;
            background: #fafafa;
            display: flex;
            flex-direction: column;
          }
          
          .gemba-print-cell-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .gemba-print-step-number {
            background: hsl(22, 90%, 54%);
            color: #fff;
            padding: 0.25rem 0.625rem;
            font-weight: 700;
            font-size: 0.875rem;
            border-radius: 0.375rem;
            display: inline-block;
          }
          
          .gemba-print-cell-image {
            width: 100%;
            max-height: 150px;
            object-fit: contain;
            margin-bottom: 0.5rem;
            border-radius: 0.375rem;
          }
          
          .gemba-print-step-text {
            font-size: 0.875rem;
            line-height: 1.5;
            color: #333;
            margin: 0;
          }
          
          .gemba-print-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding-top: 0.75rem;
            margin-top: auto;
            border-top: 1px solid #e0e0e0;
          }
          
          .gemba-print-page-number {
            font-size: 0.75rem;
            color: #666;
            background: #f0f0f0;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
          }
        `}</style>

        {pages.map((page, pageIndex) => (
          <div key={page.page_number} className="gemba-print-page">
            {/* Header on first page - logo on left, title next to it */}
            {pageIndex === 0 && (
              <div className="gemba-print-header">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Organization Logo"
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
                    {cell?.step_number && (
                      <div className="gemba-print-cell-header">
                        <span className="gemba-print-step-number">
                          {cell.step_number}
                        </span>
                      </div>
                    )}
                    {cell?.image_url && (
                      <img
                        src={cell.image_url}
                        alt={`Step ${cell.step_number || i + 1}`}
                        className="gemba-print-cell-image"
                      />
                    )}
                    {cell?.step_text && (
                      <p className="gemba-print-step-text">{cell.step_text}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer with page number - always shown */}
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