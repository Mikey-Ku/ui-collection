import type { HTMLAttributes } from "react";
import { cx } from "./cx";

/** `neutral` is the default because most badges are metadata, not status. */
export type Tone = "neutral" | "ok" | "warn" | "danger" | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Leading status dot. Use for live state, not for version numbers. */
  dot?: boolean;
}

export function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx("mk-badge", tone !== "neutral" && `mk-badge--${tone}`, className)} {...rest}>
      {dot && <span className="mk-dot" />}
      {children}
    </span>
  );
}
