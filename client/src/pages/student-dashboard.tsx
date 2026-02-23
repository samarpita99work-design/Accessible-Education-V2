import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TopBar } from "@/components/top-bar";
import { DisabilityChips, FormatChips, StatusChip } from "@/components/disability-chips";
import { useAuth } from "@/lib/auth-context";
import {
  courseOfferings,
  studentEnrollments,
  studentProgress,
  unreadContent,
  contentItems,
  announcements,
  assessments,
  getDaysUntil,
  formatTimeAgo,
  FRIENDLY_CHIP_LABELS,
} from "@/lib/mock-data";
import {
  BookOpen,
  Clock,
  ArrowRight,
  AlertTriangle,
  FileText,
  Video,
  Music,
  Presentation,
} from "lucide-react";

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Video,
  audio: Music,
  document: FileText,
  presentation: Presentation,
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const enrolled = courseOfferings.filter((co) => studentEnrollments.includes(co.id));
  const upcomingAssessments = assessments.filter(
    (a) => a.status === "upcoming" || a.status === "in_progress"
  ).slice(0, 4);
  const recentContent = contentItems
    .filter((ci) => studentEnrollments.includes(ci.courseOfferingId) && ci.publishStatus === "published")
    .slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);

  const activeModules: string[] = [];
  if (user.disabilities.some((d) => ["blind", "low_vision"].includes(d))) activeModules.push("Visual");
  if (user.disabilities.some((d) => ["deaf", "hard_of_hearing"].includes(d))) activeModules.push("Auditory");
  if (user.disabilities.some((d) => ["mute", "speech_impaired"].includes(d))) activeModules.push("Communication");
  if (user.disabilities.some((d) => ["adhd", "dyslexia", "autism", "cognitive"].includes(d))) activeModules.push("Cognitive");
  if (user.disabilities.length > 0) activeModules.push("Navigation");

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Dashboard"
        breadcrumb={`${user.program} > Year ${user.year} > Div ${user.division} > Spring 2026`}
      />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section aria-labelledby="my-courses-heading">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 id="my-courses-heading" className="font-serif text-lg font-semibold">
                    My Courses This Term
                  </h2>
                  <Link href="/student/courses">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" data-testid="link-view-all-courses">
                      View All <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrolled.map((co) => (
                    <Link key={co.id} href={`/student/courses/${co.id}`}>
                      <article
                        className="group hover-elevate rounded-md border bg-card p-4 space-y-3"
                        aria-label={`${co.course.code} ${co.course.name}, Spring 2026, Division ${co.divisions.join(", ")}, ${unreadContent[co.id] || 0} unread content items`}
                        data-testid={`card-course-${co.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="no-default-active-elevate font-mono text-[11px]">
                                {co.course.code}
                              </Badge>
                              {co.enrollmentType === "admin_assigned" ? (
                                <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                              ) : (
                                <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                              )}
                            </div>
                            <h3 className="mt-1 text-sm font-semibold leading-tight">
                              {co.course.name}
                            </h3>
                          </div>
                          {(unreadContent[co.id] || 0) > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9CD5FF] text-[10px] font-medium text-[#355872]">
                              {unreadContent[co.id]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Spring 2026 · Div {co.divisions.join(", ")} · {co.teachers[0]?.name}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{studentProgress[co.id]}%</span>
                          </div>
                          <Progress value={studentProgress[co.id]} className="h-1" />
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>

              <section aria-labelledby="new-content-heading">
                <h2 id="new-content-heading" className="font-serif text-lg font-semibold mb-4">
                  New Content
                </h2>
                <div className="space-y-2">
                  {recentContent.map((ci) => {
                    const Icon = typeIcons[ci.type] || FileText;
                    const co = courseOfferings.find((c) => c.id === ci.courseOfferingId);
                    return (
                      <Link key={ci.id} href={`/student/content/${ci.id}`}>
                        <div
                          className="flex items-center gap-3 rounded-md border bg-card p-3 hover-elevate"
                          data-testid={`row-content-${ci.id}`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{ci.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {co?.course.code} · {formatTimeAgo(ci.updatedAt)}
                            </p>
                          </div>
                          <FormatChips formats={ci.formats} size="small" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section aria-labelledby="accessibility-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="accessibility-heading" className="font-serif text-sm font-semibold">
                      Accessibility Profile
                    </h2>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Active Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {activeModules.map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="no-default-active-elevate text-xs"
                            data-testid={`chip-module-${m.toLowerCase()}`}
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <DisabilityChips disabilities={user.disabilities} size="small" />
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-edit-profile">
                        Edit Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="assessments-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="assessments-heading" className="font-serif text-sm font-semibold">
                      Upcoming Assessments
                    </h2>
                    {upcomingAssessments.map((a) => {
                      const co = courseOfferings.find((c) => c.id === a.courseOfferingId);
                      const days = getDaysUntil(a.dueDate);
                      return (
                        <Link key={a.id} href={`/student/assessments/${a.id}`}>
                          <div
                            className="flex items-center justify-between gap-2 rounded-md p-2 hover-elevate"
                            data-testid={`row-assessment-${a.id}`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{a.title}</p>
                              <p className="text-xs text-muted-foreground">{co?.course.code}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`no-default-active-elevate text-[11px] shrink-0 ${
                                days <= 2 ? "text-destructive border-destructive/30" : ""
                              }`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {days <= 0 ? "Due today" : `${days}d left`}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="announcements-heading">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h2 id="announcements-heading" className="font-serif text-sm font-semibold">
                      Announcements
                    </h2>
                    {recentAnnouncements.map((a) => (
                      <div
                        key={a.id}
                        className={`rounded-md p-2 text-sm ${a.urgent ? "border-l-2 border-l-[#C07B1A] bg-[#FFF3E0]/30 pl-3" : ""}`}
                        role={a.urgent ? "alert" : "status"}
                        data-testid={`row-announcement-${a.id}`}
                      >
                        <div className="flex items-start gap-2">
                          {a.urgent && <AlertTriangle className="h-3.5 w-3.5 text-[#C07B1A] mt-0.5 shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-medium text-xs">{a.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {a.senderName} · {formatTimeAgo(a.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link href="/announcements">
                      <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-view-announcements">
                        View All Announcements
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
