import { forwardRef } from "react";
import type { ChecklistSectionType, ChecklistItem } from "@/pages/training/ChecklistEditor";

interface ChecklistPrintViewProps {
  checklist: {
    id: string;
    title: string;
    description: string | null;
  };
  sections: ChecklistSectionType[];
  logoUrl: string | null;
  showImages: boolean;
}

interface PrintItemProps {
  item: ChecklistItem;
  getChildItems: (parentId: string) => ChecklistItem[];
  depth: number;
  isNumbered: boolean;
  index: number;
}

function PrintItem({ item, getChildItems, depth, isNumbered, index }: PrintItemProps) {
  const children = getChildItems(item.id);
  
  return (
    <>
      <div 
        className="flex items-start gap-3 py-2 border-b border-gray-200"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {isNumbered ? (
          // Numbered display
          <span className="shrink-0 mt-0.5 font-medium text-sm min-w-[24px]">
            {depth === 0 ? `${index + 1}.` : `${String.fromCharCode(65 + index)}.`}
          </span>
        ) : (
          // Checkbox for print - 20x20px with 2px border and rounded corners
          <div 
            className="shrink-0 mt-0.5 rounded"
            style={{ 
              width: '20px', 
              height: '20px', 
              minWidth: '20px', 
              minHeight: '20px',
              border: '2px solid black',
              backgroundColor: 'white',
              borderRadius: '4px'
            }}
          />
        )}
        
        <div className="flex-1">
          <span className="text-sm">{item.text}</span>
        </div>
      </div>
      
      {children.map((child, childIndex) => (
        <PrintItem
          key={child.id}
          item={child}
          getChildItems={getChildItems}
          depth={depth + 1}
          isNumbered={isNumbered}
          index={childIndex}
        />
      ))}
    </>
  );
}

export const ChecklistPrintView = forwardRef<HTMLDivElement, ChecklistPrintViewProps>(
  ({ checklist, sections, logoUrl, showImages }, ref) => {
    const getChildItems = (parentId: string, sectionItems: ChecklistItem[]): ChecklistItem[] => {
      return sectionItems.filter(item => item.parent_item_id === parentId);
    };

    return (
      <div ref={ref} className="bg-white text-black" style={{ padding: '0.5in' }}>
        {/* Header: Logo left, Title center */}
        <div className="flex items-start mb-6 pb-4 border-b-2 border-black">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="h-16 w-auto"
              />
            ) : (
              <div className="h-16 w-16 border border-gray-300 flex items-center justify-center text-xs text-gray-400">
                Logo
              </div>
            )}
          </div>

          {/* Centered title */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold">{checklist.title}</h1>
          </div>

          {/* Spacer for symmetry */}
          <div className="flex-shrink-0 w-16" />
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const topLevelItems = section.items.filter(item => !item.parent_item_id);
          const isNumbered = section.display_mode === 'numbered';
          
          return (
            <div key={section.id} className="mb-6 break-inside-avoid">
              {/* Section Header */}
              <div 
                className="font-semibold text-base py-2 px-3 mb-2"
                style={{ 
                  backgroundColor: '#f5f5f5',
                  borderLeft: '4px solid hsl(22, 90%, 54%)'
                }}
              >
                {section.title}
              </div>

              {/* Section images if present and showImages is true */}
              {showImages && section.image_url && (
                <div className="mb-3 pl-2">
                  <img 
                    src={section.image_url} 
                    alt={`${section.title} reference`}
                    className="max-h-48 border border-gray-200"
                  />
                </div>
              )}

              {/* Items */}
              <div className="pl-2">
                {topLevelItems.map((item, index) => (
                  <PrintItem
                    key={item.id}
                    item={item}
                    getChildItems={(parentId) => getChildItems(parentId, section.items)}
                    depth={0}
                    isNumbered={isNumbered}
                    index={index}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

ChecklistPrintView.displayName = "ChecklistPrintView";
