import type { RatingBreakdown as Breakdown } from "@/lib/types";

export function RatingBreakdown({ rows }: { rows: Breakdown[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.score} className="grid grid-cols-[32px_1fr_40px] items-center gap-3">
          <div className="text-right text-sm font-bold text-[#9aa5b1]">{row.score}★</div>
          <div className="h-2 overflow-hidden rounded-full bg-[#2c3440]">
            <div className="h-full rounded-full bg-[#00c030]" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
          <div className="text-sm text-[#9aa5b1]">{row.count}</div>
        </div>
      ))}
    </div>
  );
}
