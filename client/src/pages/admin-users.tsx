import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DisabilityChips, StatusChip } from "@/components/disability-chips";
import { allUsers, type UserRole } from "@/lib/mock-data";
import { Search, Upload, Plus, Download } from "lucide-react";

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allUsers.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="User Management" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "student", "teacher", "admin"] as const).map((r) => (
                <Button key={r} variant={roleFilter === r ? "default" : "secondary"} size="sm" onClick={() => setRoleFilter(r)} data-testid={`button-filter-${r}`}>
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  {r !== "all" && (
                    <Badge variant="outline" className="ml-1 no-default-active-elevate text-[10px]">
                      {allUsers.filter((u) => u.role === r).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="gap-1" data-testid="button-bulk-import"><Upload className="h-3.5 w-3.5" /> Import CSV</Button>
              <Button size="sm" className="gap-1" data-testid="button-add-user"><Plus className="h-3.5 w-3.5" /> Add User</Button>
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-export"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>

          <div className="rounded-md border">
            <table className="w-full" aria-label="Users">
              <thead>
                <tr className="border-b bg-primary text-primary-foreground">
                  <th scope="col" className="text-left text-xs font-medium p-3">Name</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden sm:table-cell">Email</th>
                  <th scope="col" className="text-left text-xs font-medium p-3">Role</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden md:table-cell">Program / Year / Div</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden lg:table-cell">Status</th>
                  <th scope="col" className="text-left text-xs font-medium p-3 hidden xl:table-cell">Accessibility</th>
                  <th scope="col" className="text-right text-xs font-medium p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className={`border-b ${i % 2 === 1 ? "bg-[#EEF5FB]/30" : ""}`} data-testid={`row-user-${u.id}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">{u.email}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="no-default-active-elevate text-[11px] capitalize">{u.role}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                      {u.program ? `${u.program} / Y${u.year} / ${u.division || "-"}` : "-"}
                    </td>
                    <td className="p-3 hidden lg:table-cell"><StatusChip status={u.status} /></td>
                    <td className="p-3 hidden xl:table-cell">
                      {u.disabilities.length > 0 ? (
                        <DisabilityChips disabilities={u.disabilities} size="small" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-edit-user-${u.id}`}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
