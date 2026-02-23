import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { announcements, formatTimeAgo } from "@/lib/mock-data";
import { AlertTriangle, Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Announcements" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[800px] space-y-4">
          {announcements.map((a) => (
            <Card
              key={a.id}
              className={a.urgent ? "border-l-2 border-l-[#C07B1A]" : ""}
              data-testid={`card-announcement-${a.id}`}
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {a.urgent ? (
                      <AlertTriangle className="h-4 w-4 text-[#C07B1A] shrink-0" />
                    ) : (
                      <Megaphone className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    {a.urgent && (
                      <Badge variant="outline" className="no-default-active-elevate text-[10px] text-[#C07B1A] border-[#C07B1A]/30">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.content}</p>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                  <span>{a.senderName} · {a.senderRole}</span>
                  <div className="flex items-center gap-2">
                    {a.courseName && <Badge variant="outline" className="no-default-active-elevate text-[10px]">{a.courseName}</Badge>}
                    <span>{formatTimeAgo(a.timestamp)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
