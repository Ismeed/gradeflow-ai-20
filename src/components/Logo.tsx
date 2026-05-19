import { GraduationCap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const color = variant === "sidebar" ? "text-sidebar-foreground" : "text-primary";
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold ${color}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success text-success-foreground">
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className="text-lg tracking-tight">GradeFlow</span>
    </Link>
  );
}
