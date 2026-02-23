import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/disability-chips";
import { courseOfferings, contentItems, conversionJobs, formatTimeAgo } from "@/lib/mock-data";
import { ArrowRight, Users, FileText, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

export default function TeacherDashboard() {
  const teacherOfferings = courseOfferings.filter((co) => co.teachers.some((t) => t.id === "t1"));
  const pendingReviews = conversionJobs.filter((j) => j.status === "ready_for_review" && j.teacherName === "Prof. Anand Rao");
  const inProgress = conversionJobs.filter((j) => j.status === "in_progress" && j.teacherName === "Prof. Anand Rao");
  const recentContent = contentItems.filter((ci) => ci.uploadedBy === "t1").slice(0, 5);

  const brailleCount = pendingReviews.filter((j) => j.formatType === "braille").length;
  const simplifiedCount = pendingReviews.filter((j) => j.formatType === "simplified").length;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Teaching Overview" breadcrumb="Spring 2026" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section aria-labelledby="my-courses-heading">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 id="my-courses-heading" className="font-serif text-lg font-semibold">My Courses</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teacherOfferings.map((co) => (
                    <Link key={co.id} href={`/teacher/courses/${co.id}`}>
                      <Card className="hover-elevate" data-testid={`card-course-${co.id}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="no-default-active-elevate font-mono text-xs">{co.course.code}</Badge>
                            <h3 className="text-sm font-semibold">{co.course.name}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {co.studentCount} students</span>
                            <span>Div {co.divisions.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {contentItems.filter((ci) => ci.courseOfferingId === co.id).length} content items</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>

              <section aria-labelledby="recent-content-heading">
                <h2 id="recent-content-heading" className="font-serif text-lg font-semibold mb-4">Recent Content Activity</h2>
                <div className="space-y-2">
                  {recentContent.map((ci) => {
                    const co = courseOfferings.find((c) => c.id === ci.courseOfferingId);
                    return (
                      <div key={ci.id} className="flex items-center justify-between gap-3 rounded-md border bg-card p-3" data-testid={`row-content-${ci.id}`}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ci.title}</p>
                          <p className="text-xs text-muted-foreground">{co?.course.code} · Uploaded {formatTimeAgo(ci.uploadedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            {ci.conversionProgress.tier1 === "completed" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#2E8B6E]"><CheckCircle className="h-3 w-3" /> T1</span>
                            ) : ci.conversionProgress.tier1 === "in_progress" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#C07B1A]"><Loader2 className="h-3 w-3 animate-spin" /> T1</span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> T1</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {ci.conversionProgress.tier2 === "completed" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#2E8B6E]"><CheckCircle className="h-3 w-3" /> T2</span>
                            ) : ci.conversionProgress.tier2 === "ready_for_review" ? (
                              <span className="flex items-center gap-0.5 text-xs text-[#355872]"><Clock className="h-3 w-3" /> T2</span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-[#C07B1A]"><Loader2 className="h-3 w-3 animate-spin" /> T2</span>
                            )}
                          </div>
                          <StatusChip status={ci.publishStatus} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section aria-labelledby="conversion-queue-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="conversion-queue-heading" className="font-serif text-sm font-semibold">Conversion Queue</h2>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>Braille</span>
                        <Badge className="no-default-active-elevate text-xs bg-[#9CD5FF] text-[#355872]">{brailleCount} pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>Simplified Text</span>
                        <Badge className="no-default-active-elevate text-xs bg-[#9CD5FF] text-[#355872]">{simplifiedCount} pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-accent text-sm">
                        <span>In Progress</span>
                        <Badge variant="outline" className="no-default-active-elevate text-xs">{inProgress.length} jobs</Badge>
                      </div>
                    </div>
                    <Link href="/teacher/conversions">
                      <Button variant="ghost" size="sm" className="text-xs w-full gap-1" data-testid="link-review-queue">
                        Review Queue <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
