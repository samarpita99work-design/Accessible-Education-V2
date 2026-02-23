import { useAuth } from "@/lib/auth-context";
import { type UserRole } from "@/lib/mock-data";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  title?: string;
  breadcrumb?: string;
}

export function TopBar({ title, breadcrumb }: TopBarProps) {
  const { role, setRole, user, setShowProfileSetup } = useAuth();

  return (
    <header
      className="flex h-14 items-center justify-between gap-4 border-b bg-card px-4"
      role="banner"
      data-testid="top-bar"
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="flex flex-col">
          {title && <h1 className="text-sm font-semibold leading-tight">{title}</h1>}
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="hidden sm:block">
              <span className="text-xs text-muted-foreground">{breadcrumb}</span>
            </nav>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
          <SelectTrigger
            className="w-[130px] text-xs"
            data-testid="select-role-switcher"
            aria-label="Switch user role"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student View</SelectItem>
            <SelectItem value="teacher">Teacher View</SelectItem>
            <SelectItem value="admin">Admin View</SelectItem>
          </SelectContent>
        </Select>
        {role === "student" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProfileSetup(true)}
            data-testid="button-profile-setup"
            className="text-xs"
          >
            Profile Setup
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications, 3 unread"
          data-testid="button-notifications"
        >
          <div className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-destructive-foreground">
              3
            </span>
          </div>
        </Button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium"
          data-testid="avatar-user"
          aria-label={user.name}
        >
          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
