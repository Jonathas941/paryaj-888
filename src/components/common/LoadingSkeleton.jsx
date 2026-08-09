import React from "react";
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className = "" }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2/80", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-3 w-10" />
      </div>
      <LoadingSkeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-9 flex-1" />
        <LoadingSkeleton className="h-9 flex-1" />
        <LoadingSkeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}