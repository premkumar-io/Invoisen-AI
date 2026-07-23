import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  paid: "bg-success/15 text-success",
  partially_paid: "bg-warning/20 text-warning-foreground",
  unpaid: "bg-muted text-muted-foreground",
  overdue: "bg-destructive/15 text-destructive",
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/15 text-primary",
  archived: "bg-accent text-foreground",
  Pending: "bg-warning/20 text-warning-foreground",
  Paid: "bg-success/15 text-success",
  Draft: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/15 text-destructive",
};

const dot: Record<string, string> = {
  paid: "bg-success",
  partially_paid: "bg-warning",
  unpaid: "bg-muted-foreground",
  overdue: "bg-destructive",
  draft: "bg-muted-foreground",
  published: "bg-primary",
  archived: "bg-foreground",
  Pending: "bg-warning",
  Paid: "bg-success",
  Draft: "bg-muted-foreground",
  Overdue: "bg-destructive",
};

export function StatusBadge({ status, withDot = false }: { status?: string; withDot?: boolean }) {
  const normalized = (status ?? "draft").toLowerCase();
  const label =
    normalized === "partially_paid"
      ? "Partially paid"
      : normalized === "partially paid"
        ? "Partially paid"
        : (status ?? "Draft");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        styles[normalized] ?? styles.draft,
      )}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full", dot[normalized] ?? dot.draft)} />}
      {label}
    </span>
  );
}

const avatarTones: Record<string, string> = {
  purple: "bg-purple/15 text-purple",
  blue: "bg-primary/15 text-primary",
  red: "bg-destructive/15 text-destructive",
  green: "bg-success/15 text-success",
  gray: "bg-muted text-muted-foreground",
};

export function ClientAvatar({ initials, tone }: { initials: string; tone: string }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        avatarTones[tone] ?? avatarTones.gray,
      )}
    >
      {initials}
    </span>
  );
}
