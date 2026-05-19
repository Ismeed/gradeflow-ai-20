import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CRITERIA, gradeBadgeClass } from "@/lib/grade-utils";
import { Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/student/results")({
  component: Results,
});

function Results() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["results", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*, grades(*)").eq("student_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const downloadReport = (project: any, grade: any) => {
    const lines = [
      "GRADEFLOW — PROJECT GRADING REPORT",
      "=".repeat(40),
      `Project: ${project.project_title}`,
      `Supervisor: ${project.supervisor_name ?? "—"}`,
      `Submitted: ${new Date(project.submission_date).toLocaleDateString()}`,
      "",
      "EVALUATION:",
      ...CRITERIA.map((c) => `  ${c.label}: ${grade[`${c.key}_score`]}/100 — ${grade[`${c.key}_remarks`] ?? ""}`),
      "",
      `TOTAL SCORE: ${Number(grade.total_score).toFixed(2)} / 100`,
      `GRADE: ${grade.grade}`,
      `Status: ${grade.approval_status}`,
      `Recommendation: ${grade.recommendation ?? "—"}`,
      `Feedback: ${grade.supervisor_feedback ?? "—"}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `gradeflow-${project.project_title.replace(/\s+/g, "-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadFile = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("project-files").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not download file"); return; }
    window.open(data.signedUrl, "_blank");
    void name;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Results</h1>
        <p className="text-sm text-muted-foreground">View supervisor feedback and grading reports.</p>
      </div>

      {!data || data.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">No projects yet.</Card>
      ) : data.map((p) => {
        const g = Array.isArray(p.grades) ? p.grades[0] : null;
        return (
          <Card key={p.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{p.project_title}</h2>
                <p className="text-sm text-muted-foreground">Submitted {new Date(p.submission_date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{p.status}</Badge>
                {g?.grade && <span className={`rounded-md px-3 py-1 text-sm font-semibold ${gradeBadgeClass(g.grade)}`}>Grade {g.grade}</span>}
                {p.file_url && (
                  <Button size="sm" variant="outline" onClick={() => downloadFile(p.file_url!, p.file_name ?? "project")}>
                    <Download className="mr-2 h-4 w-4" />File
                  </Button>
                )}
                {g && (
                  <Button size="sm" onClick={() => downloadReport(p, g)}>
                    <Download className="mr-2 h-4 w-4" />Report
                  </Button>
                )}
              </div>
            </div>

            {!g ? (
              <p className="mt-4 text-sm text-muted-foreground">Awaiting supervisor review.</p>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {CRITERIA.map((c) => (
                    <div key={c.key} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{c.label}</span>
                        <span className="text-sm tabular-nums">{(g as any)[`${c.key}_score`]} / 100</span>
                      </div>
                      {(g as any)[`${c.key}_remarks`] && (
                        <p className="mt-1 text-xs text-muted-foreground">{(g as any)[`${c.key}_remarks`]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 rounded-lg bg-accent/40 p-4 md:grid-cols-3">
                  <Stat label="Total score" value={`${Number(g.total_score).toFixed(2)} / 100`} />
                  <Stat label="Recommendation" value={g.recommendation ?? "—"} />
                  <Stat label="Approval status" value={g.approval_status} />
                </div>
                {g.supervisor_feedback && (
                  <div>
                    <h3 className="text-sm font-semibold">Supervisor feedback</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{g.supervisor_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
