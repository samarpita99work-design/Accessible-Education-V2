import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hierarchyTree, type HierarchyNode } from "@/lib/mock-data";
import { ChevronRight, ChevronDown, Plus, Edit, Archive, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function TreeNode({ node, depth = 0, onSelect, selectedId }: { node: HierarchyNode; depth?: number; onSelect: (n: HierarchyNode) => void; selectedId: string | null }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        className={`flex items-center gap-2 w-full text-left py-2 px-2 rounded-md text-sm transition-colors ${isSelected ? "bg-accent border border-primary/20" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { if (hasChildren) setExpanded(!expanded); onSelect(node); }}
        data-testid={`tree-node-${node.id}`}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : <span className="w-3.5" />}
        <span className="flex-1 font-medium">{node.name}</span>
        <Badge variant="outline" className="no-default-active-elevate text-[10px] ml-2">
          {node.type}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-0.5 ml-1">
          <Users className="h-3 w-3" /> {node.studentCount}
        </span>
      </button>
      {expanded && hasChildren && (
        <div>{node.children.map((c) => <TreeNode key={c.id} node={c} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />)}</div>
      )}
    </div>
  );
}

export default function AdminHierarchy() {
  const [selected, setSelected] = useState<HierarchyNode | null>(null);
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Institute Hierarchy" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-serif text-sm font-semibold">Hierarchy Tree</h2>
                    <Button size="sm" className="gap-1" data-testid="button-add-node"><Plus className="h-3.5 w-3.5" /> Add Node</Button>
                  </div>
                  <div className="space-y-0.5">
                    <TreeNode node={hierarchyTree} onSelect={setSelected} selectedId={selected?.id || null} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              {selected ? (
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-serif text-sm font-semibold">Node Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Name</label>
                        <Input defaultValue={selected.name} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Type</label>
                        <Badge variant="outline" className="no-default-active-elevate capitalize">{selected.type}</Badge>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Students</label>
                        <p className="text-sm font-medium">{selected.studentCount}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Children</label>
                        <p className="text-sm font-medium">{selected.children.length} nodes</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 gap-1" onClick={() => toast({ title: "Node updated" })}><Edit className="h-3.5 w-3.5" /> Edit</Button>
                      <Button variant="secondary" className="flex-1 gap-1"><Plus className="h-3.5 w-3.5" /> Add Child</Button>
                    </div>
                    <Button variant="ghost" className="w-full gap-1 text-muted-foreground" data-testid="button-retire-node">
                      <Archive className="h-3.5 w-3.5" /> Retire Node
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    Select a node to view and edit its details
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
