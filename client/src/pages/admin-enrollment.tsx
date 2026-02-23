import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseOfferings, allUsers } from "@/lib/mock-data";
import { Users, Upload, UserPlus } from "lucide-react";

export default function AdminEnrollment() {
  const [tab, setTab] = useState("core");

  const coreOfferings = courseOfferings.filter((co) => co.enrollmentType === "admin_assigned");
  const electiveOfferings = courseOfferings.filter((co) => co.enrollmentType === "student_selected");

  const waitlistData = [
    { student: "Neha Verma", course: "CS305 AI", position: 1, status: "waitlisted" },
    { student: "Amit Sharma", course: "CS305 AI", position: 2, status: "waitlisted" },
    { student: "Deepak Jain", course: "CS304 Software Eng.", position: 3, status: "waitlisted" },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Enrollment Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList data-testid="tabs-enrollment">
              <TabsTrigger value="core" data-testid="tab-core">Core Enrollments</TabsTrigger>
              <TabsTrigger value="elective" data-testid="tab-elective">Elective Enrollments</TabsTrigger>
              <TabsTrigger value="waitlists" data-testid="tab-waitlists">Waitlists</TabsTrigger>
              <TabsTrigger value="bulk" data-testid="tab-bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground">Core courses assigned by administration</p>
                <Button size="sm" className="gap-1" data-testid="button-bulk-enroll">
                  <UserPlus className="h-3.5 w-3.5" /> Bulk Enroll Cohort
                </Button>
              </div>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Core enrollments">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Course Offering</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Term</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Enrolled</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Capacity</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">% Filled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coreOfferings.map((co, i) => {
                      const pct = Math.round((co.studentCount / co.capacity) * 100);
                      return (
                        <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-enrollment-${co.id}`}>
                          <td className="p-3">
                            <div>
                              <p className="text-sm font-medium">{co.course.code} {co.course.name}</p>
                              <p className="text-xs text-muted-foreground">Div {co.divisions.join(", ")}</p>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Spring {co.year}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" /><span className="text-sm">{co.studentCount}</span></div>
                          </td>
                          <td className="p-3 text-sm">{co.capacity}</td>
                          <td className="p-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className={`h-1.5 w-20 ${pct > 90 ? "[&>div]:bg-destructive" : ""}`} />
                              <span className={`text-xs ${pct > 90 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="elective" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Student-selected elective courses</p>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Elective enrollments">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Enrolled</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Capacity</th>
                      <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electiveOfferings.map((co, i) => {
                      const pct = Math.round((co.studentCount / co.capacity) * 100);
                      return (
                        <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                          <td className="p-3">
                            <p className="text-sm font-medium">{co.course.code} {co.course.name}</p>
                          </td>
                          <td className="p-3 text-sm">{co.studentCount}</td>
                          <td className="p-3 text-sm">{co.capacity}</td>
                          <td className="p-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 w-20" />
                              <span className="text-xs text-muted-foreground">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="waitlists" className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Students waiting for enrollment in capacity-limited courses</p>
              <div className="rounded-md border">
                <table className="w-full" aria-label="Waitlists">
                  <thead>
                    <tr className="border-b bg-primary text-primary-foreground">
                      <th scope="col" className="text-left text-xs font-medium p-3">#</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Student</th>
                      <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                      <th scope="col" className="text-right text-xs font-medium p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistData.map((w, i) => (
                      <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`}>
                        <td className="p-3 text-sm font-mono">{w.position}</td>
                        <td className="p-3 text-sm">{w.student}</td>
                        <td className="p-3 text-sm">{w.course}</td>
                        <td className="p-3 text-right">
                          <Button variant="secondary" size="sm" className="text-xs" data-testid={`button-promote-${i}`}>Promote</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="mt-4">
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-serif text-lg font-semibold">Bulk Import Enrollment</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Upload a CSV file with enrollment data from your SIS/ERP system.
                      The file will be validated before processing.
                    </p>
                    <Button className="gap-1" data-testid="button-upload-csv">
                      <Upload className="h-4 w-4" /> Upload CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
