import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { gradeBadgeClass } from "@/lib/grade-utils";

export const Route = createFileRoute("/_app/admin/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*, grades(*)").order("submission_date", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr><th className="p-3">Title</th><th className="p-3">Supervisor</th><th className="p-3">Submitted</th><th className="p-3">Status</th><th className="p-3">Grade</th></tr>
          </thead>
          <tbody>
            {data?.map((p) => {
              const g = Array.isArray(p.grades) ? (p.grades as any[])[0] : null;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium">{p.project_title}</td>
                  <td className="p-3 text-muted-foreground">{p.supervisor_name || "—"}</td>
                  <td className="p-3">{new Date(p.submission_date).toLocaleDateString()}</td>
                  <td className="p-3"><Badge variant="secondary">{p.status}</Badge></td>
                  <td className="p-3">{g?.grade ? <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${gradeBadgeClass(g.grade)}`}>{g.grade}</span> : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
