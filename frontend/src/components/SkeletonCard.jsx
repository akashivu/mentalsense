
import React from "react";


export default function SkeletonCard({ loading = false, heightClass = "h-24", children }) {
  if (!loading) return <>{children}</>;

  return (
    <div className={`w-full bg-white rounded-2xl border border-gray-200 p-4 shadow-sm`}>
      <div className={`animate-pulse flex flex-col gap-3`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded-md" />
          <div className="h-6 w-12 bg-gray-200 rounded-md" />
        </div>

        <div className={`rounded-md bg-gray-200 ${heightClass}`} />

        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200 rounded-md" />
          <div className="flex-1 h-8 bg-gray-200 rounded-md" />
          <div className="flex-1 h-8 bg-gray-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}
