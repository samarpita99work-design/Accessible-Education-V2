import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminStats, hierarchyTree, type HierarchyNode } from "@/lib/mock-data";
import { Users, Accessibility, BookOpen, BarChart3, AlertTriangle, XCircle, TrendingUp, TrendingDown, ChevronRight, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const CHART_COLORS = ["#355872", "#7AAACE", "#9CD5FF", "#5C7A99", "#2E8B6E"];

function HierarchyTreeNode({ node, depth = 0, onSelect }: { node: HierarchyNode; depth?: number; onSelect: (node: HierarchyNode) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        className="flex items-center gap-1 w-full text-left py-1 px-1 rounded hover-elevate text-sm"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => { if (hasChildren) setExpanded(!expanded); onSelect(node); }}
        data-testid={`tree-node-${node.id}`}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate flex-1">{node.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">{node.studentCount}</span>
      </button>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <HierarchyTreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const stats = adminStats;

  const statCards = [
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: Users, trend: "+12%", up: true },
    { label: "With Disabilities", value: stats.studentsWithDisabilities.toLocaleString(), icon: Accessibility, trend: "+8%", up: true },
    { label: "Teachers", value: stats.totalTeachers.toString(), icon: BookOpen, trend: "+3", up: true },
    { label: "Content Items", value: stats.contentItems.toLocaleString(), icon: BarChart3, trend: "+124", up: true },
    { label: "Coverage", value: `${stats.accessibilityCoverage}%`, icon: BarChart3, trend: "+5%", up: true },
    { label: "Failure Rate", value: `${stats.conversionFailureRate}%`, icon: AlertTriangle, trend: "-0.3%", up: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Admin Dashboard" breadcrumb="National Institute of Technology" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map((stat) => (
              <Card key={stat.label} data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-serif">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.up ? <TrendingUp className="h-3 w-3 text-[#2E8B6E]" /> : <TrendingDown className="h-3 w-3 text-[#2E8B6E]" />}
                    <span className="text-[11px] text-[#2E8B6E]">{stat.trend}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-3">Hierarchy</h3>
                {selectedNode && (
                  <div className="mb-2 p-2 rounded-md bg-accent text-xs">
                    <p className="font-medium">Filtering: {selectedNode.name}</p>
                    <Button variant="ghost" size="sm" className="text-xs p-0 h-auto mt-1" onClick={() => setSelectedNode(null)}>Clear filter</Button>
                  </div>
                )}
                <div className="max-h-[400px] overflow-auto">
                  <HierarchyTreeNode node={hierarchyTree} onSelect={setSelectedNode} />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-serif text-sm font-semibold">Accessibility Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Disability Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={stats.disabilityBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percentage }) => `${percentage}%`} labelLine={false}>
                          {stats.disabilityBreakdown.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stats.disabilityBreakdown.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1 text-[11px]">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Format Usage (%)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.formatUsage} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="format" tick={{ fontSize: 11 }} width={70} />
                        <Tooltip />
                        <Bar dataKey="usage" fill="#7AAACE" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Monthly Conversions</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={stats.monthlyConversions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="successful" stroke="#7AAACE" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="failed" stroke="#C0392B" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-serif text-sm font-semibold">Alerts</h3>
                <div className="space-y-2">
                  <div className="rounded-md border-l-2 border-l-[#C07B1A] bg-[#FFF3E0]/30 p-2">
                    <p className="text-xs font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-[#C07B1A]" /> 8 items missing Braille</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PGDM Year 1 program</p>
                  </div>
                  <div className="rounded-md border-l-2 border-l-destructive bg-destructive/5 p-2">
                    <p className="text-xs font-medium flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> 3 conversion jobs failed</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">CS303, MATH301</p>
                  </div>
                  <div className="rounded-md border-l-2 border-l-[#C07B1A] bg-[#FFF3E0]/30 p-2">
                    <p className="text-xs font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-[#C07B1A]" /> 5 students without profiles</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">New enrollments pending setup</p>
                  </div>
                  <div className="rounded-md border-l-2 border-l-[#2980B9] bg-[#EBF4FB] p-2">
                    <p className="text-xs font-medium flex items-center gap-1">12 Tier 2 reviews pending</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Avg wait: 2.3 hours</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs w-full" data-testid="link-view-all-alerts">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
