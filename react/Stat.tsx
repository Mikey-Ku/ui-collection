import type { ReactNode } from "react";
import { cx } from "./cx";

export interface StatProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/** A single headline number. Three in a row is the usual dose; six is a table. */
export function Stat({ label, value, className }: StatProps) {
  return (
    <div className={cx("mk-stat", className)}>
      <span className="mk-eyebrow">{label}</span>
      <span className="mk-stat__value">{value}</span>
    </div>
  );
}
