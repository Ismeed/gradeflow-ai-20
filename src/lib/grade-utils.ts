export const CRITERIA = [
  { key: "problem_definition", label: "Problem Definition" },
  { key: "literature_review", label: "Literature Review" },
  { key: "methodology", label: "Methodology" },
  { key: "system_design", label: "System Design" },
  { key: "implementation", label: "Implementation" },
  { key: "documentation", label: "Documentation" },
  { key: "presentation", label: "Presentation" },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export function letterGrade(total: number): "A" | "B" | "C" | "D" | "F" {
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
}

export function gradeBadgeClass(g: string | null | undefined) {
  switch (g) {
    case "A": return "bg-success text-success-foreground";
    case "B": return "bg-chart-3 text-primary-foreground";
    case "C": return "bg-warning text-warning-foreground";
    case "D": return "bg-chart-5 text-primary-foreground";
    case "F": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}
