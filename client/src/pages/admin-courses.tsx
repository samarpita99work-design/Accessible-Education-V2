import { Link } from "wouter";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courseOfferings } from "@/lib/mock-data";
import { Users, Plus, UserPlus } from "lucide-react";

export default function AdminCourses() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Course Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{courseOfferings.length} course offerings this term</p>
            <Button size="sm" className="gap-1" data-testid="button-add-course"><Plus className="h-3.5 w-3.5" /> Add Course</Button>
          </div>
          <div className="rounded-md border">
            <table className="w-full" aria-label="Course offerings">
              <thead>
                <tr className="border-b bg-primary text-primary-foreground">
                  <th scope="col" className="text-left text-xs font-medium p-3">Course</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Term</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Divisions</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Teachers</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Students</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Type</th>
                  <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courseOfferings.map((co, i) => (
                  <tr key={co.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-course-${co.id}`}>
                    <td className="p-3">
                      <div>
                        <p className="text-sm font-medium">{co.course.code} {co.course.name}</p>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">Spring {co.year}</td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{co.divisions.join(", ")}</td>
                    <td className="p-3 text-xs">{co.teachers.map((t) => t.name).join(", ")}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1 text-sm"><Users className="h-3 w-3 text-muted-foreground" /> {co.studentCount}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {co.enrollmentType === "admin_assigned" ? (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#EEF5FB] text-[#355872]">Core</Badge>
                      ) : (
                        <Badge variant="outline" className="no-default-active-elevate text-[10px] bg-[#F0F9F4] text-[#2E8B6E]">Elective</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid={`button-manage-teachers-${co.id}`}>
                        <UserPlus className="h-3 w-3" /> Teachers
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
