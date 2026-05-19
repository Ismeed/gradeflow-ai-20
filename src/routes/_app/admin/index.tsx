import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, FileText, GaugeCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [projects, grades, users] = await Promise.all([
        supabase.from("projects").select("id,status", { count: "exact" }),
        supabase.from("grades").select("total_score,grade"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      return {
        projectCount: projects.count ?? 0,
        gradeCount: grades.data?.length ?? 0,
        userCount: users.count ?? 0,
        avg: grades.data?.length
          ? grades.data.reduce((s, g) => s + Number(g.total_score), 0) / grades.data.length
          : 0,
        passRate: grades.data?.length
          ? (grades.data.filter((g) => g.grade && g.grade !== "F").length / grades.data.length) * 100
          : 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Institution-wide grading overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={Users} label="Users" value={data?.userCount ?? 0} />
        <Stat icon={FileText} label="Projects" value={data?.projectCount ?? 0} />
        <Stat icon={GaugeCircle} label="Avg score" value={data ? data.avg.toFixed(1) : "—"} />
        <Stat icon={CheckCircle2} label="Pass rate" value={data ? `${data.passRate.toFixed(0)}%` : "—"} accent />
      </div>
      <Card className="p-6 text-sm text-muted-foreground">
        Use the side navigation to manage users, monitor projects, and export reports.
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold">{value}</div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
