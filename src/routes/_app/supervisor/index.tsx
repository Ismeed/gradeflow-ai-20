import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, FileText, GaugeCircle, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/supervisor/")({
  component: SupervisorDashboard,
});

function SupervisorDashboard() {
  const { user } = useAuth();

  // Assigned by supervisor_id OR by name match — for simplicity, show all unassigned + assigned to me
  const { data: projects } = useQuery({
    queryKey: ["sup-projects", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, grades(*)")
        .or(`supervisor_id.eq.${user!.id},supervisor_id.is.null`)
        .order("submission_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const claim = async (id: string) => {
    const { error } = await supabase.from("projects").update({ supervisor_id: user!.id, status: "under_review" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Claimed");
    window.location.reload();
  };

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage.from("project-files").createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, "_blank");
  };

  const total = projects?.length ?? 0;
  const graded = projects?.filter((p) => p.grades && (p.grades as any).length > 0).length ?? 0;
  const pending = total - graded;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supervisor Dashboard</h1>
        <p className="text-sm text-muted-foreground">Review assigned projects and submit grades.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={FileText} label="Total" value={total} />
        <Stat icon={ClipboardCheck} label="Graded" value={graded} accent />
        <Stat icon={GaugeCircle} label="Pending" value={pending} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Projects queue</h2>
        {!projects || projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects available.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => {
              const g = Array.isArray(p.grades) ? p.grades[0] : null;
              const mine = p.supervisor_id === user!.id;
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.project_title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Supervisor (declared): {p.supervisor_name || "—"} · Submitted {new Date(p.submission_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{p.status}</Badge>
                    {g?.grade && <Badge>{g.grade}</Badge>}
                    {p.file_url && (
                      <Button size="sm" variant="outline" onClick={() => downloadFile(p.file_url!)}>
                        <Download className="mr-1 h-3.5 w-3.5" />File
                      </Button>
                    )}
                    {!mine && !p.supervisor_id ? (
                      <Button size="sm" variant="outline" onClick={() => claim(p.id)}>Claim</Button>
                    ) : null}
                    <Button asChild size="sm">
                      <Link to="/supervisor/grade/$projectId" params={{ projectId: p.id }}>
                        {g ? "Edit grade" : "Grade"}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
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
