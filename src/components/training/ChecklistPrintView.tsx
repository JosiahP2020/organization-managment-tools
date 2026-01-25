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
        {/* Checkbox square for print */}
        <div 
          className="w-5 h-5 border-2 border-black bg-white shrink-0 mt-0.5"
          style={{ minWidth: '20px', minHeight: '20px' }}
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

    return (
      <div ref={ref} className="p-8 bg-white text-black min-h-screen">
        {/* Header with logo */}
        <div className="flex justify-center mb-6 pb-4 border-b-2 border-black">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="max-h-16 w-auto"
            />
          ) : (
            <div className="text-2xl font-bold">Company Logo</div>
          )}
        </div>

        {/* Checklist Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{checklist.title}</h1>
          {checklist.description && (
            <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
          )}
        </div>

        {/* Date field */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Date:</span>
            <div className="w-32 border-b border-black" />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const topLevelItems = section.items.filter(item => !item.parent_item_id);
          
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
