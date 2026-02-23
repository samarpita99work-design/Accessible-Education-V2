import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/disability-chips";
import { conversionJobs, formatTimeAgo } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export default function TeacherConversions() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "braille" | "simplified" | "audio" | "captions">("all");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const teacherJobs = conversionJobs.filter((j) => j.teacherName === "Prof. Anand Rao");
  const filtered = filter === "all" ? teacherJobs : teacherJobs.filter((j) => j.formatType === filter);
  const selected = conversionJobs.find((j) => j.id === selectedJob);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Conversion Queue" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {(["all", "braille", "simplified", "audio", "captions"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "secondary"} size="sm" onClick={() => setFilter(f)} data-testid={`button-filter-${f}`}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-md border">
                <table className="w-full" aria-label="Conversion jobs">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Content</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Course</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Format</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Status</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Updated</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((j, i) => (
                      <tr
                        key={j.id}
                        className={`border-b cursor-pointer ${selectedJob === j.id ? "bg-accent" : i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}
                        onClick={() => setSelectedJob(j.id)}
                        data-testid={`row-job-${j.id}`}
                      >
                        <td className="p-3 text-sm font-medium">{j.contentTitle}</td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{j.courseName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="no-default-active-elevate text-[11px] capitalize">{j.formatType.replace("_", " ")}</Badge>
                        </td>
                        <td className="p-3"><StatusChip status={j.status} /></td>
                        <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{formatTimeAgo(j.updatedAt)}</td>
                        <td className="p-3 text-right">
                          {j.status === "ready_for_review" && (
                            <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-review-${j.id}`}>Review</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No conversion jobs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              {selected ? (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm capitalize">{selected.formatType.replace("_", " ")} Preview</h3>
                    <div className="rounded-md bg-accent p-4 text-sm">
                      {selected.formatType === "braille" ? (
                        <div className="font-mono text-base leading-relaxed">
                          ⠠⠊⠝⠞⠗⠕⠙⠥⠉⠞⠊⠕⠝ ⠞⠕ ⠠⠝⠑⠥⠗⠁⠇ ⠠⠝⠑⠞⠺⠕⠗⠅⠎
                        </div>
                      ) : selected.formatType === "simplified" ? (
                        <div className="leading-relaxed">
                          <p className="font-medium">Simplified Version:</p>
                          <p className="mt-2">A neural network is a computer system that learns from data. It works like the human brain. It has layers of connected parts called nodes.</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Preview not available for this format type.</p>
                      )}
                    </div>
                    {selected.status === "failed" && selected.errorMessage && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {selected.errorMessage}
                      </div>
                    )}
                    {selected.status === "ready_for_review" && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1 gap-1"
                          onClick={() => { setSelectedJob(null); toast({ title: "Conversion rejected", description: "The conversion will be re-queued." }); }}
                          data-testid="button-reject"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          className="flex-1 gap-1"
                          onClick={() => { setSelectedJob(null); toast({ title: "Conversion approved", description: "Format published to students." }); }}
                          data-testid="button-approve"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    Click a row to preview the conversion
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
