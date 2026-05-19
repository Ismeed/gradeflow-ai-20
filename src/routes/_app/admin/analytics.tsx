import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/_app/admin/analytics")({
  component: Analytics,
});

const COLORS = ["oklch(0.72 0.14 155)", "oklch(0.4 0.1 255)", "oklch(0.78 0.15 75)", "oklch(0.55 0.18 25)", "oklch(0.65 0.13 220)"];

function Analytics() {
  const { data: grades } = useQuery({
    queryKey: ["analytics-grades"],
    queryFn: async () => (await supabase.from("grades").select("grade,total_score")).data ?? [],
  });

  const distribution = ["A", "B", "C", "D", "F"].map((g) => ({
    grade: g, count: grades?.filter((x) => x.grade === g).length ?? 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Grade distribution</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={distribution}>
                <XAxis dataKey="grade" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.28 0.08 255)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold">Pass / Fail</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Pass", value: grades?.filter((g) => g.grade && g.grade !== "F").length ?? 0 },
                    { name: "Fail", value: grades?.filter((g) => g.grade === "F").length ?? 0 },
                  ]}
                  dataKey="value" nameKey="name" outerRadius={90} label
                >
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
