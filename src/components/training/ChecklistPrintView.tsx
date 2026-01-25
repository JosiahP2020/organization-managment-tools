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
}

interface PrintItemProps {
  item: ChecklistItem;
  getChildItems: (parentId: string) => ChecklistItem[];
  depth: number;
}

function PrintItem({ item, getChildItems, depth }: PrintItemProps) {
  const children = getChildItems(item.id);
  
  return (
    <>
      <div 
        className="flex items-start gap-3 py-2 border-b border-gray-200"
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Square checkbox for print - 20x20px with 2px border */}
        <div 
          className="shrink-0 mt-0.5"
          style={{ 
            width: '20px', 
            height: '20px', 
            minWidth: '20px', 
            minHeight: '20px',
            border: '2px solid black',
            backgroundColor: 'white'
          }}
        />
        
        <div className="flex-1">
          <span className="text-sm">{item.text}</span>
          
          {item.notes && (
            <p className="text-xs text-gray-500 italic mt-1">
              Note: {item.notes}
            </p>
          )}
        </div>
      </div>
      
      {children.map((child) => (
        <PrintItem
          key={child.id}
          item={child}
          getChildItems={getChildItems}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

export const ChecklistPrintView = forwardRef<HTMLDivElement, ChecklistPrintViewProps>(
  ({ checklist, sections, logoUrl }, ref) => {
    const getChildItems = (parentId: string, sectionItems: ChecklistItem[]): ChecklistItem[] => {
      return sectionItems.filter(item => item.parent_item_id === parentId);
    };

    // Calculate total completion
    const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
    const completedItems = sections.reduce((acc, section) => 
      acc + section.items.filter(item => item.is_completed).length, 0
    );

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* New Header Layout: Logo left, Title center, Date right */}
        <div className="flex items-start mb-6 pb-4 border-b-2 border-black">
          {/* Sub-logo on the left */}
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

          {/* Centered title and completion */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold">{checklist.title}</h1>
            {checklist.description && (
              <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {completedItems} of {totalItems} completed
            </p>
          </div>

          {/* Date field on the right */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-sm font-medium">Date:</span>
            <div className="w-32 border-b border-black" />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const topLevelItems = section.items.filter(item => !item.parent_item_id);
          const sectionCompleted = section.items.filter(i => i.is_completed).length;
          const sectionTotal = section.items.length;
          
          return (
            <div key={section.id} className="mb-6 break-inside-avoid">
              {/* Section Header with progress */}
              <div 
                className="flex items-center justify-between font-semibold text-base py-2 px-3 mb-2"
                style={{ 
                  backgroundColor: '#f5f5f5',
                  borderLeft: '4px solid hsl(22, 90%, 54%)'
                }}
              >
                <span>{section.title}</span>
                <span className="text-sm font-normal text-gray-500">
                  {sectionCompleted}/{sectionTotal}
                </span>
              </div>

              {/* Section image if present */}
              {section.image_url && (
                <div className="mb-3 pl-2">
                  <img 
                    src={section.image_url} 
                    alt={`${section.title} reference`}
                    className="max-h-32 border border-gray-200"
                  />
                </div>
              )}

              {/* Items */}
              <div className="pl-2">
                {topLevelItems.map((item) => (
                  <PrintItem
                    key={item.id}
                    item={item}
                    getChildItems={(parentId) => getChildItems(parentId, section.items)}
                    depth={0}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="fixed bottom-4 left-0 right-0 text-center text-xs text-gray-400">
          Printed on {new Date().toLocaleDateString()}
        </div>
      </div>
    );
  }
);

ChecklistPrintView.displayName = "ChecklistPrintView";
