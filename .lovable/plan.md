# GradeFlow System — Build Plan

A modern academic project grading platform with three roles (Student, Supervisor, Admin). Scope is large, so I'll deliver a strong **Phase 1** that nails the design system, landing page, auth, and core workflows end-to-end, then iterate.

## Design system
- Palette: navy (#0B2545), white, gray, soft green (success/accent)
- Clean academic, institutional, card-based layout
- Responsive sidebar dashboards, dark/light toggle
- Tokens defined in `src/styles.css` (oklch); shadcn variants only — no ad-hoc classes

## Phase 1 — what I'll build now

**Public**
- Landing page: hero ("Digital Project Grading and Evaluation Platform"), CTAs (Submit Project / Lecturer Login), features, benefits, footer
- `/auth` — student/lecturer/admin login + student registration + forgot password

**Backend (Lovable Cloud)**
- Enable Cloud (Supabase under the hood)
- Tables: `profiles`, `user_roles` (enum: student/supervisor/admin), `projects`, `grades`, `notifications`
- Storage bucket `project-files` (private) with RLS
- RLS policies + `has_role()` security-definer function
- Trigger: auto-create profile + default `student` role on signup

**Student**
- Dashboard (status cards, notifications, progress)
- Submit project (form + PDF/DOCX upload)
- View feedback + final grade + downloadable report

**Supervisor**
- Dashboard with assigned projects table
- Grading interface with 7 criteria (Problem Definition, Literature Review, Methodology, System Design, Implementation, Documentation, Presentation) — score + remarks, auto total, auto letter grade (A/B/C/D/F), recommendation, approve/revise

**Admin**
- Dashboard: manage students/supervisors, assign supervisors, monitor submissions
- Simple analytics cards (avg score, pass/fail, submissions trend)

## Phase 2 — follow-up (after Phase 1 ships)
- Advanced charts (department performance, supervisor stats)
- Export reports (CSV/PDF)
- PDF preview, search/filter/pagination polish
- Email notifications

## Technical notes
- TanStack Start + file-based routes (`/`, `/auth`, `/_authenticated/student`, `/supervisor`, `/admin`)
- Roles enforced via `user_roles` table + `has_role()` (never on profiles)
- Grade computation: avg of 7 scores → A ≥80, B ≥70, C ≥60, D ≥50, else F
- File uploads via Supabase Storage with signed URLs

Confirm to proceed and I'll start with the design system + Cloud setup.
