import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Upload, GraduationCap, Users, ClipboardCheck,
  LogOut, FileText, BarChart3,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV: Record<AppRole, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/submit", label: "Submit Project", icon: Upload },
    { to: "/student/results", label: "My Results", icon: FileText },
  ],
  supervisor: [
    { to: "/supervisor", label: "Dashboard", icon: LayoutDashboard },
    { to: "/supervisor/projects", label: "Assigned Projects", icon: ClipboardCheck },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/projects", label: "All Projects", icon: FileText },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const { role, user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = role ? NAV[role] : [];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border p-5">
          <Logo variant="sidebar" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((i) => {
            const active = path === i.to || (i.to !== `/${role}` && path.startsWith(i.to));
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <i.icon className="h-4 w-4" />{i.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-3 px-3 py-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-sidebar-foreground/60">
              <GraduationCap className="h-3 w-3" />{role}
            </div>
            <div className="mt-1 truncate text-sm font-medium">{user?.email}</div>
          </div>
          <Button onClick={() => signOut()} variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        {/* mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-card p-4 md:hidden">
          <Logo />
          <Button onClick={() => signOut()} size="sm" variant="ghost"><LogOut className="h-4 w-4" /></Button>
        </div>
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
