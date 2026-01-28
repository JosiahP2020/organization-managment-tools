import { Widget } from "@/hooks/useWidgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/menu-config/DynamicIcon";
import { Link2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface QuickLinksWidgetProps {
  widget: Widget;
  onEdit?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
}

export function QuickLinksWidget({ widget }: QuickLinksWidgetProps) {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const links = widget.config.links || [];

  const handleLinkClick = (link: { document_id: string }) => {
    if (!organization?.slug) return;
    // Navigate to the document
    navigate(`/dashboard/${organization.slug}/document/${link.document_id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {widget.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No quick links configured
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {links.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
                onClick={() => handleLinkClick(link)}
              >
                <DynamicIcon name={link.icon || "file"} className="h-4 w-4" />
                <span className="truncate">{link.title}</span>
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
