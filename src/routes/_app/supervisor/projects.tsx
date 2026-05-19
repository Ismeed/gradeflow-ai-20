import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/supervisor/projects")({
  component: () => {
    // Reuses the dashboard listing — redirect-style page is unnecessary; link directly.
    if (typeof window !== "undefined") window.location.replace("/supervisor");
    return null;
  },
});
