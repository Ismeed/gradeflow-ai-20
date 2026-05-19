import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  CheckCircle2, ClipboardCheck, FileSearch, GaugeCircle,
  GraduationCap, Sparkles, Upload, Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GradeFlow — Digital Project Grading & Evaluation Platform" },
      { name: "description", content: "Submit, grade, and manage tertiary-institution projects online with automated scoring and digital supervisor feedback." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#benefits" className="hover:text-foreground">Benefits</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth" search={{ tab: "register" }}>Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center text-primary-foreground">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Built for higher institutions
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Digital Project Grading and Evaluation Platform
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/80">
              GradeFlow streamlines how students submit projects, how supervisors
              evaluate them, and how administrators manage academic records — all in
              one secure, modern workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-success text-success-foreground hover:bg-success/90">
                <Link to="/auth" search={{ tab: "register" }}>
                  <Upload className="mr-2 h-4 w-4" /> Submit Project
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link to="/auth">
                  <GraduationCap className="mr-2 h-4 w-4" /> Lecturer Login
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-6 text-sm">
              <div><div className="text-2xl font-semibold">7</div><div className="text-primary-foreground/70">Evaluation criteria</div></div>
              <div><div className="text-2xl font-semibold">3</div><div className="text-primary-foreground/70">User roles</div></div>
              <div><div className="text-2xl font-semibold">100%</div><div className="text-primary-foreground/70">Digital workflow</div></div>
            </div>
          </div>

          {/* Workflow illustration */}
          <div className="relative">
            <Card className="rotate-1 border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <div className="space-y-3 text-primary-foreground">
                <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success text-success-foreground"><Upload className="h-5 w-5" /></div>
                  <div><div className="font-medium">Student submits project</div><div className="text-xs text-primary-foreground/70">PDF / DOCX with abstract</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success text-success-foreground"><FileSearch className="h-5 w-5" /></div>
                  <div><div className="font-medium">Supervisor reviews</div><div className="text-xs text-primary-foreground/70">Digital file preview</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success text-success-foreground"><ClipboardCheck className="h-5 w-5" /></div>
                  <div><div className="font-medium">Grades 7 criteria</div><div className="text-xs text-primary-foreground/70">Auto total · Letter grade</div></div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success text-success-foreground"><GaugeCircle className="h-5 w-5" /></div>
                  <div><div className="font-medium">Student gets result</div><div className="text-xs text-primary-foreground/70">Feedback + report</div></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything an academic project needs</h2>
          <p className="mt-3 text-muted-foreground">From submission to graded report — one institutional workspace.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, t: "Project Submission", d: "Upload PDF/DOCX with title, abstract, and supervisor assignment." },
            { icon: ClipboardCheck, t: "7-Criteria Grading", d: "Problem definition, literature, methodology, design, implementation, docs, presentation." },
            { icon: GaugeCircle, t: "Automatic Computation", d: "Real-time total score and letter grade (A–F) calculation." },
            { icon: Users, t: "Three User Roles", d: "Students, supervisors, and administrators — each with tailored dashboards." },
            { icon: FileSearch, t: "Digital Feedback", p: true, d: "Per-criterion remarks plus overall recommendation and approval status." },
            { icon: CheckCircle2, t: "Submission Tracking", d: "Live status from submitted → under review → graded with notifications." },
          ].map(({ icon: Icon, t, d }) => (
            <Card key={t} className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-accent/40 py-20">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Benefits of automated grading</h2>
            <p className="mt-4 text-muted-foreground">
              Replace paper-based evaluation with a transparent, auditable, and instant
              workflow that keeps faculty productive and students informed.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Consistent, criteria-based evaluation across departments",
              "Zero arithmetic mistakes — totals and grades computed automatically",
              "Instant student feedback and downloadable grading reports",
              "Centralized record-keeping for institutional analytics",
              "Role-based security with full submission audit trail",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: "Submit", d: "Student uploads project + abstract." },
            { n: "02", t: "Review", d: "Supervisor downloads and reviews." },
            { n: "03", t: "Grade", d: "Score 7 criteria with remarks." },
            { n: "04", t: "Result", d: "Auto grade + feedback delivered." },
          ].map((s) => (
            <Card key={s.n} className="p-6">
              <div className="text-3xl font-bold text-primary/40">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Designed for academic project evaluation and grading management.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GradeFlow System
          </div>
        </div>
      </footer>
    </div>
  );
}
