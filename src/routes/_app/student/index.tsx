import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { gradeBadgeClass } from "@/lib/grade-utils";
import { Upload, FileText, GaugeCircle, Bell } from "lucide-react";

export const Route = createFileRoute("/_app/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const { data: projects } = useQuery({
    queryKey: ["my-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, grades(*)")
        .eq("student_id", user!.id)
        .order("submission_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: notifs } = useQuery({
    queryKey: ["my-notifs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  const total = projects?.length ?? 0;
  const graded = projects?.filter((p) => p.grades && (p.grades as any).length > 0).length ?? 0;
  const pending = total - graded;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your project submissions and results.</p>
        </div>
        <Button asChild><Link to="/student/submit"><Upload className="mr-2 h-4 w-4" />Submit project</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={FileText} label="Submissions" value={total} />
        <StatCard icon={GaugeCircle} label="Graded" value={graded} accent="success" />
        <StatCard icon={Bell} label="Pending review" value={pending} accent="warning" />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Your projects</h2>
          <span className="text-xs text-muted-foreground">{total} total</span>
        </div>
        {!projects || projects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No projects yet. <Link to="/student/submit" className="text-primary hover:underline">Submit your first project</Link>.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => {
              const g = Array.isArray(p.grades) ? p.grades[0] : null;
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.project_title}</span>
                      {g?.grade && <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${gradeBadgeClass(g.grade)}`}>{g.grade}</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(p.submission_date).toLocaleDateString()} · Supervisor {p.supervisor_name || "—"}
                    </div>
                    {g && (
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={Number(g.total_score)} className="h-1.5 max-w-xs" />
                        <span className="text-xs text-muted-foreground">{Number(g.total_score).toFixed(1)} / 100</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{p.status}</Badge>
                    <Button asChild size="sm" variant="outline"><Link to="/student/results">View</Link></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Notifications</h2>
        {!notifs || notifs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifs.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                <Bell className="mt-0.5 h-4 w-4 text-primary" />
                <div className="flex-1">
                  <div>{n.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: "success" | "warning" }) {
  const bg = accent === "success" ? "bg-success/15 text-success" : accent === "warning" ? "bg-warning/20 text-warning-foreground" : "bg-accent text-accent-foreground";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg}`}><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}
