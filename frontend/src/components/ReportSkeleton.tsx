import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="mt-5 h-4 w-2/4" />
          <Skeleton className="mt-1 h-8 w-3/4" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="mt-5 h-4 w-2/4" />
          <Skeleton className="mt-1 h-8 w-3/4" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="mt-5 h-4 w-2/4" />
          <Skeleton className="mt-1 h-8 w-3/4" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="mt-5 h-4 w-2/4" />
          <Skeleton className="mt-1 h-8 w-3/4" />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-accent p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-1 h-8 w-3/4" />
            </div>
            <div className="rounded-xl bg-accent p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-1 h-8 w-3/4" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-8 w-1/2" />
          <div className="mt-5 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
