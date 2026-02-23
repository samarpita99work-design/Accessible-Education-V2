import { useState } from "react";
import { useParams, Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatChips, StatusChip } from "@/components/disability-chips";
import { courseOfferings, contentItems, assessments, announcements, formatTimeAgo, getDaysUntil } from "@/lib/mock-data";
import { ArrowLeft, FileText, Video, Music, Presentation, Clock, User, Mail } from "lucide-react";

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, video: Video, audio: Music, document: FileText, presentation: Presentation };

export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const co = courseOfferings.find((c) => c.id === id);
  const [tab, setTab] = useState("overview");

  if (!co) return <div className="p-8 text-center text-muted-foreground">Course not found</div>;

  const courseContent = contentItems.filter((ci) => ci.courseOfferingId === co.id && ci.publishStatus === "published");
  const courseAssessments = assessments.filter((a) => a.courseOfferingId === co.id);
  const courseAnnouncements = announcements.filter((a) => a.courseOfferingId === co.id);

  return (
    <div className="flex flex-col h-full">
      <TopBar title={co.course.name} breadcrumb={`${co.course.code} > Spring ${co.year} > Div ${co.divisions.join(", ")}`} />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/student/courses">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </Link>
            <Badge variant="outline" className="no-default-active-elevate font-mono">{co.course.code}</Badge>
            <h1 className="font-serif text-xl font-semibold">{co.course.name}</h1>
            {co.enrollmentType === "admin_assigned" ? (
              <Badge variant="outline" className="no-default-active-elevate text-xs bg-[#EEF5FB] text-[#355872]">Core</Badge>
            ) : (
              <Badge variant="outline" className="no-default-active-elevate text-xs bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Spring {co.year} · Division {co.divisions.join(", ")} · {co.teachers[0]?.name}
          </p>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList data-testid="tabs-course-detail">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
              <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
              <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-sm">About this Course</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{co.course.description}</p>
                  {co.course.prerequisites.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Prerequisites</p>
                      <div className="flex gap-1">
                        {co.course.prerequisites.map((p) => (
                          <Badge key={p} variant="outline" className="no-default-active-elevate text-xs font-mono">{p}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-sm">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {co.teachers[0]?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{co.teachers[0]?.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {co.teachers[0]?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {courseAnnouncements.length > 0 && (
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-sm">Latest Announcements</h3>
                    {courseAnnouncements.slice(0, 2).map((a) => (
                      <div key={a.id} className={`rounded-md p-3 text-sm ${a.urgent ? "border-l-2 border-l-[#C07B1A] bg-[#FFF3E0]/20" : "bg-accent"}`}>
                        <p className="font-medium text-xs">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{formatTimeAgo(a.timestamp)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              <div className="rounded-md border">
                <table className="w-full" aria-label="Course content">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Title</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Type</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Formats</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseContent.map((ci, i) => {
                      const Icon = typeIcons[ci.type] || FileText;
                      return (
                        <tr key={ci.id} className={`border-b hover-elevate ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                          <td className="p-3">
                            <Link href={`/student/content/${ci.id}`}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium hover:underline" data-testid={`link-content-${ci.id}`}>
                                  {ci.title}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground capitalize hidden sm:table-cell">{ci.type}</td>
                          <td className="p-3 hidden md:table-cell"><FormatChips formats={ci.formats} size="small" /></td>
                          <td className="p-3 text-xs text-muted-foreground">{formatTimeAgo(ci.updatedAt)}</td>
                        </tr>
                      );
                    })}
                    {courseContent.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No content available yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-4 space-y-3">
              {courseAssessments.map((a) => {
                const days = getDaysUntil(a.dueDate);
                return (
                  <Link key={a.id} href={`/student/assessments/${a.id}`}>
                    <Card className="hover-elevate" data-testid={`card-assessment-${a.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-medium">{a.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.type} · {a.questionCount} questions · {a.durationMinutes} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusChip status={a.status} />
                          {a.status === "graded" && a.score !== undefined && (
                            <Badge variant="outline" className="no-default-active-elevate text-xs">
                              {a.score}/{a.maxScore}
                            </Badge>
                          )}
                          {(a.status === "upcoming" || a.status === "in_progress") && (
                            <Badge variant="outline" className={`no-default-active-elevate text-[11px] ${days <= 2 ? "text-destructive border-destructive/30" : ""}`}>
                              <Clock className="h-3 w-3 mr-1" />{days <= 0 ? "Due today" : `${days}d`}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              {courseAssessments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No assessments yet</p>
              )}
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  <p>Course messages are available in the Messages section.</p>
                  <Link href="/messages">
                    <Button variant="secondary" size="sm" className="mt-3" data-testid="link-go-to-messages">
                      Go to Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
