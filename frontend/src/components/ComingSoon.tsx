import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  icon: Icon,
  title,
  blurb,
}: {
  icon: LucideIcon;
  title: string;
  blurb: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{blurb}</p>
      <Button asChild className="mt-6 rounded-xl font-semibold">
        <Link to="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
