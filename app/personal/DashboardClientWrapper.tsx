"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: DashboardSkeleton,
});

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Resumen</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
            <div className="mb-2 h-4 w-20 rounded bg-neutral-800" />
            <div className="h-8 w-32 rounded bg-neutral-800" />
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/40" />
    </div>
  );
}

export default function DashboardClientWrapper() {
  return <DashboardClient />;
}
