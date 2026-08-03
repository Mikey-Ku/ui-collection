import { cx } from "./cx";
import type { Tone } from "./Badge";

export interface MeterProps {
  /** 0–1. Values outside the range are clamped, not thrown. */
  value: number;
  tone?: Exclude<Tone, "neutral" | "accent">;
  label?: string;
  className?: string;
}

export function Meter({ value, tone, label, className }: MeterProps) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div
      className={cx("mk-meter", tone && `mk-meter--${tone}`, className)}
      role="meter"
      aria-valuenow={Number(pct.toFixed(1))}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="mk-meter__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
