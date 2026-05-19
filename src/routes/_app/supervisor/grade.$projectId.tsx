import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRITERIA, gradeBadgeClass, letterGrade, type CriterionKey } from "@/lib/grade-utils";
import { Save, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/supervisor/grade/$projectId")({
  component: GradePage,
});

type Scores = Record<CriterionKey, number>;
type Remarks = Record<CriterionKey, string>;

const blankScores = Object.fromEntries(CRITERIA.map((c) => [c.key, 0])) as Scores;
const blankRemarks = Object.fromEntries(CRITERIA.map((c) => [c.key, ""])) as Remarks;

function GradePage() {
  const { projectId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<Scores>(blankScores);
  const [remarks, setRemarks] = useState<Remarks>(blankRemarks);
  const [feedback, setFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [approval, setApproval] = useState<"pending" | "approved" | "revision_required">("pending");
  const [saving, setSaving] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*, grades(*)").eq("id", projectId).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const gs = project?.grades as unknown as any[] | null;
    const g = gs && gs[0];
    if (g) {
      setScores(Object.fromEntries(CRITERIA.map((c) => [c.key, g[`${c.key}_score`] ?? 0])) as Scores);
      setRemarks(Object.fromEntries(CRITERIA.map((c) => [c.key, g[`${c.key}_remarks`] ?? ""])) as Remarks);
      setFeedback(g.supervisor_feedback ?? "");
      setRecommendation(g.recommendation ?? "");
      setApproval(g.approval_status ?? "pending");
    }
  }, [project]);

  const total = useMemo(
    () => CRITERIA.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0) / CRITERIA.length,
    [scores]
  );
  const grade = letterGrade(total);

  const downloadFile = async () => {
    if (!project?.file_url) return;
    const { data } = await supabase.storage.from("project-files").createSignedUrl(project.file_url, 60);
    if (data) window.open(data.signedUrl, "_blank");
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload: any = {
      project_id: projectId,
      supervisor_feedback: feedback,
      recommendation,
      approval_status: approval,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
    };
    CRITERIA.forEach((c) => {
      payload[`${c.key}_score`] = Number(scores[c.key]) || 0;
      payload[`${c.key}_remarks`] = remarks[c.key];
    });
    const { error } = await supabase.from("grades").upsert(payload, { onConflict: "project_id" });
    if (!error) {
      await supabase.from("projects").update({ status: approval === "approved" ? "graded" : "under_review" }).eq("id", projectId);
      await supabase.from("notifications").insert({
        user_id: project!.student_id,
        message: `Your project "${project!.project_title}" has been graded (${grade}).`,
      });
    }
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Grade saved"); navigate({ to: "/supervisor" }); }
  };

  if (!project) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.project_title}</h1>
          <p className="text-sm text-muted-foreground">Supervisor: {project.supervisor_name || "—"}</p>
        </div>
        {project.file_url && (
          <Button variant="outline" onClick={downloadFile}>
            <Download className="mr-2 h-4 w-4" />Download project file
          </Button>
        )}
      </div>

      {project.abstract && (
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4" />Abstract</div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{project.abstract}</p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Evaluation criteria</h2>
        <div className="space-y-4">
          {CRITERIA.map((c) => (
            <div key={c.key} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_120px]">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{c.label}</Label>
                <Textarea
                  rows={2}
                  placeholder="Remarks"
                  value={remarks[c.key]}
                  onChange={(e) => setRemarks((r) => ({ ...r, [c.key]: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Score / 100</Label>
                <Input
                  type="number" min={0} max={100}
                  value={scores[c.key]}
                  onChange={(e) => setScores((s) => ({ ...s, [c.key]: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-accent/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total score</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">{total.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="rounded-lg bg-accent/40 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Final grade</div>
            <div className={`mt-1 inline-flex items-center rounded-md px-3 py-1.5 text-2xl font-bold ${gradeBadgeClass(grade)}`}>{grade}</div>
          </div>
          <div className="rounded-lg bg-accent/40 p-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Approval</Label>
            <Select value={approval} onValueChange={(v) => setApproval(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revision_required">Revision required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Recommendation</Label>
            <Input value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="e.g. Recommended for defense" />
          </div>
          <div className="space-y-2">
            <Label>Overall supervisor feedback</Label>
            <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save grade"}</Button>
        </div>
      </Card>
    </div>
  );
}
