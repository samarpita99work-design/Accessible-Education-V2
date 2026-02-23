import { useState } from "react";
import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { courseOfferings, studentEnrollments, studentProgress, unreadContent } from "@/lib/mock-data";

export default function StudentCourses() {
  const [filter, setFilter] = useState<"all" | "core" | "elective">("all");
  const enrolled = courseOfferings.filter((co) => studentEnrollments.includes(co.id));
  const filtered = enrolled.filter((co) => {
    if (filter === "core") return co.enrollmentType === "admin_assigned";
    if (filter === "elective") return co.enrollmentType === "student_selected";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="My Courses" breadcrumb="B.Tech CS > Year 3 > Spring 2026" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center gap-2">
            {(["all", "core", "elective"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter(f)}
                data-testid={`button-filter-${f}`}
              >
                {f === "all" ? "All Courses" : f === "core" ? "Core" : "Elective"}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((co) => (
              <Link key={co.id} href={`/student/courses/${co.id}`}>
                <Card className="hover-elevate h-full" data-testid={`card-course-${co.id}`}>
                  <CardContent className="p-5 space-y-3 h-full flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">
                        {co.course.code}
                      </Badge>
                      {co.enrollmentType === "admin_assigned" ? (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                      ) : (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                      )}
                      {(unreadContent[co.id] || 0) > 0 && (
                        <Badge className="no-default-active-elevate text-[10px] bg-[#9CD5FF] text-[#355872]">
                          {unreadContent[co.id]} new
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{co.course.name}</h3>
                    <p className="text-xs text-muted-foreground flex-1">
                      {co.course.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Spring {co.year} · Div {co.divisions.join(", ")} · {co.teachers[0]?.name}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{studentProgress[co.id]}%</span>
                      </div>
                      <Progress value={studentProgress[co.id]} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
