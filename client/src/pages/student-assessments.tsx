import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/disability-chips";
import { assessments, courseOfferings, getDaysUntil } from "@/lib/mock-data";
import { Clock, ArrowRight } from "lucide-react";

export default function StudentAssessments() {
  const upcoming = assessments.filter((a) => a.status === "upcoming" || a.status === "in_progress");
  const past = assessments.filter((a) => a.status === "completed" || a.status === "graded");

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Assessments" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[900px] space-y-6">
          <section>
            <h2 className="font-serif text-lg font-semibold mb-4">Upcoming & In Progress</h2>
            <div className="space-y-3">
              {upcoming.map((a) => {
                const co = courseOfferings.find((c) => c.id === a.courseOfferingId);
                const days = getDaysUntil(a.dueDate);
                return (
                  <Link key={a.id} href={`/student/assessments/${a.id}`}>
                    <Card className="hover-elevate" data-testid={`card-assessment-${a.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co?.course.code}</Badge>
                            <h3 className="text-sm font-medium">{a.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.type} · {a.questionCount} questions · {a.durationMinutes} min (x2.0 = {a.durationMinutes * 2} min)
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusChip status={a.status} />
                          <Badge
                            variant="outline"
                            className={`no-default-active-elevate text-[11px] ${days <= 2 ? "text-destructive border-destructive/30" : ""}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {days <= 0 ? "Due today" : `${days}d left`}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upcoming assessments</p>}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold mb-4">Completed</h2>
            <div className="space-y-3">
              {past.map((a) => {
                const co = courseOfferings.find((c) => c.id === a.courseOfferingId);
                return (
                  <Card key={a.id} data-testid={`card-assessment-${a.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co?.course.code}</Badge>
                          <h3 className="text-sm font-medium">{a.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{a.type} · {a.questionCount} questions</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusChip status={a.status} />
                        {a.score !== undefined && (
                          <Badge variant="outline" className="no-default-active-elevate text-xs font-medium">
                            {a.score}/{a.maxScore}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {past.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No completed assessments</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
