import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  MessageSquare,
  User,
  Users,
  Building2,
  GraduationCap,
  RefreshCw,
  BarChart3,
  Settings,
  Megaphone,
  Accessibility,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const studentNav = [
  { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
  { title: "Courses", url: "/student/courses", icon: BookOpen },
  { title: "Assessments", url: "/student/assessments", icon: ClipboardList },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const teacherNav = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/teacher/courses", icon: BookOpen },
  { title: "Content Library", url: "/teacher/content", icon: FileText },
  { title: "Conversion Queue", url: "/teacher/conversions", icon: RefreshCw },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const adminNav = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Hierarchy", url: "/admin/hierarchy", icon: Building2 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Courses", url: "/admin/courses", icon: BookOpen },
  { title: "Enrollment", url: "/admin/enrollment", icon: GraduationCap },
  { title: "Conversions", url: "/admin/conversions", icon: RefreshCw },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { role, user } = useAuth();
  const [location] = useLocation();

  const navItems = role === "student" ? studentNav : role === "teacher" ? teacherNav : adminNav;
  const roleLabel = role === "student" ? "Student" : role === "teacher" ? "Teacher" : "Administrator";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Accessibility className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-semibold leading-tight" data-testid="text-app-name">
              AccessEd
            </span>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.title === "Messages" && (
                          <Badge variant="secondary" className="ml-auto text-xs no-default-active-elevate">
                            3
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link href="/profile" data-testid="link-profile">
          <div className="flex items-center gap-3 rounded-md p-2 hover-elevate">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
