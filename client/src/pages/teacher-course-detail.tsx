import { useState } from "react";
import { useParams, Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FormatChips, StatusChip } from "@/components/disability-chips";
import { DisabilityChips } from "@/components/disability-chips";
import { courseOfferings, contentItems, allUsers, formatTimeAgo } from "@/lib/mock-data";
import { ArrowLeft, Plus, Upload, Trash2, Eye, Edit, FileText, Video, Music, Presentation, AlertTriangle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, video: Video, audio: Music, document: FileText, presentation: Presentation };

export default function TeacherCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const co = courseOfferings.find((c) => c.id === id);
  const { toast } = useToast();
  const [tab, setTab] = useState("content");
  const [showUpload, setShowUpload] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState(1);

  if (!co) return <div className="p-8 text-center text-muted-foreground">Course not found</div>;

  const courseContent = contentItems.filter((ci) => ci.courseOfferingId === co.id);
  const courseStudents = allUsers.filter((u) => u.role === "student" && u.program === "B.Tech Computer Science" && (u.year === 3 || !u.year));
  const deleteItem = courseContent.find((ci) => ci.id === showDelete);

  return (
    <div className="flex flex-col h-full">
      <TopBar title={co.course.name} breadcrumb={`${co.course.code} > Spring ${co.year} > Div ${co.divisions.join(", ")}`} />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/teacher/dashboard">
                <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
              </Link>
              <Badge variant="outline" className="no-default-active-elevate font-mono">{co.course.code}</Badge>
              <h1 className="font-serif text-xl font-semibold">{co.course.name}</h1>
            </div>
            <Button onClick={() => { setShowUpload(true); setUploadStep(1); }} className="gap-1" data-testid="button-upload-content">
              <Plus className="h-4 w-4" /> Upload Content
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
              <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
              <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <div className="rounded-md border">
                <table className="w-full" aria-label="Content items">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Title</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Type</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Formats</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Status</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Updated</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseContent.map((ci, i) => {
                      const Icon = typeIcons[ci.type] || FileText;
                      return (
                        <tr key={ci.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-content-${ci.id}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium">{ci.title}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground capitalize hidden sm:table-cell">{ci.type}</td>
                          <td className="p-3 hidden md:table-cell"><FormatChips formats={ci.formats} size="small" /></td>
                          <td className="p-3"><StatusChip status={ci.publishStatus} /></td>
                          <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{formatTimeAgo(ci.updatedAt)}</td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" aria-label={`Preview ${ci.title}`} data-testid={`button-preview-${ci.id}`}><Eye className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" aria-label={`Edit ${ci.title}`} data-testid={`button-edit-${ci.id}`}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" aria-label={`Delete ${ci.title}`} onClick={() => setShowDelete(ci.id)} data-testid={`button-delete-${ci.id}`}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{co.studentCount} students enrolled</span>
              </div>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Enrolled students">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Name</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Division</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Accessibility</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.slice(0, 8).map((s, i) => (
                      <tr key={s.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-student-${s.id}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{s.name}</p>
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Div {s.division || "A"}</td>
                        <td className="p-3">
                          {s.disabilities.length > 0 ? (
                            <DisabilityChips disabilities={s.disabilities} size="small" />
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell"><StatusChip status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-4">
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Assessment management will be available here. You can create quizzes, assignments, and exams for this course.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-serif">Upload Content</DialogTitle>
            <DialogDescription>Step {uploadStep} of 3</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= uploadStep ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          {uploadStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="content-title">Title</Label><Input id="content-title" placeholder="Enter content title" data-testid="input-content-title" /></div>
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select defaultValue="pdf"><SelectTrigger id="content-type" data-testid="select-content-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF Document</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="presentation">Presentation</SelectItem><SelectItem value="document">Document</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label htmlFor="content-desc">Description</Label><Textarea id="content-desc" placeholder="Brief description" data-testid="textarea-content-desc" /></div>
            </div>
          )}
          {uploadStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Course Offering</Label><Input value={`${co.course.code} – ${co.course.name} – Spring ${co.year}`} readOnly className="bg-muted" /></div>
              <div className="space-y-2">
                <Label>Sections</Label>
                <div className="flex gap-3">
                  {co.divisions.map((d) => (
                    <div key={d} className="flex items-center gap-2">
                      <Checkbox id={`div-${d}`} defaultChecked data-testid={`checkbox-div-${d}`} />
                      <Label htmlFor={`div-${d}`} className="text-sm">Div {d}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {uploadStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-md border-2 border-dashed p-8">
                <div className="text-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, MP4, MP3, JPG, PNG, URL...</p>
                  <Button variant="secondary" size="sm" data-testid="button-browse-file">Browse Files</Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setUploadStep(Math.max(1, uploadStep - 1))} disabled={uploadStep === 1}>Back</Button>
            {uploadStep < 3 ? (
              <Button onClick={() => setUploadStep(uploadStep + 1)} data-testid="button-upload-next">Next</Button>
            ) : (
              <Button onClick={() => { setShowUpload(false); toast({ title: "Upload started", description: "Tier 1 conversion in progress" }); }} data-testid="button-upload-convert">Upload & Convert</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete '{deleteItem?.title}'?
            </DialogTitle>
          </DialogHeader>
          {deleteItem && (
            <div className="space-y-4">
              <div className="rounded-md bg-[#FFF3E0]/50 border border-[#C07B1A]/20 p-4 space-y-2 text-sm">
                <p>Viewed by <strong>{deleteItem.viewCount}</strong> students</p>
                <p><strong>{deleteItem.progressCount}</strong> students have this in their progress history</p>
                {deleteItem.linkedAssessments.length > 0 && (
                  <p className="text-[#C07B1A] font-medium">Referenced by {deleteItem.linkedAssessments.length} assessment(s) — students will lose reference material</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Moving to Trash keeps it recoverable for 30 days. Students will be notified of removal.</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowDelete(null)} data-testid="button-cancel-delete">Cancel</Button>
                <Button variant="destructive" onClick={() => { setShowDelete(null); toast({ title: "Moved to Trash", description: "Content moved to trash. Students will be notified." }); }} data-testid="button-confirm-delete">Move to Trash</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
