import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_app/student/submit")({
  component: SubmitProject,
});

function SubmitProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!file) { toast.error("Please attach a project document"); return; }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("project-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("projects").insert({
        student_id: user.id,
        project_title: String(fd.get("project_title")),
        supervisor_name: String(fd.get("supervisor_name")),
        abstract: String(fd.get("abstract")),
        file_url: path,
        file_name: file.name,
        status: "submitted",
      });
      if (insErr) throw insErr;
      toast.success("Project submitted");
      navigate({ to: "/student" });
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Project</h1>
        <p className="text-sm text-muted-foreground">Upload your project document along with key details.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="student_name" label="Student name" defaultValue={user?.user_metadata?.full_name ?? ""} />
            <Field name="registration_number" label="Registration #" />
            <Field name="department" label="Department" />
            <Field name="supervisor_name" label="Supervisor name" required />
          </div>
          <Field name="project_title" label="Project title" required />
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea id="abstract" name="abstract" rows={5} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Project document (PDF or DOCX)</Label>
            <Input
              id="file" type="file" accept=".pdf,.doc,.docx,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} required
            />
            {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>
          <div className="text-xs text-muted-foreground">Submission date: {new Date().toLocaleString()}</div>
          <Button type="submit" disabled={busy} className="w-full">
            <Upload className="mr-2 h-4 w-4" />{busy ? "Submitting…" : "Submit project"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Field({ name, label, required, defaultValue }: { name: string; label: string; required?: boolean; defaultValue?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required={required} defaultValue={defaultValue} />
    </div>
  );
}
