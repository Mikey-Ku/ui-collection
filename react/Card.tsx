import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import type { Tone } from "./Badge";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  /** Right side of the header — a badge, a button, a timestamp. */
  action?: ReactNode;
  footer?: ReactNode;
  /**
   * Marks the card's leading edge with a state colour. Themes that have a
   * margin-stripe signature (ledger) render it; others ignore it.
   */
  verdict?: Exclude<Tone, "neutral" | "accent">;
}

export function Card({ title, action, footer, verdict, className, children, ...rest }: CardProps) {
  return (
    <section className={cx("mk-card", className)} data-verdict={verdict} {...rest}>
      {(title || action) && (
        <div className="mk-card__head">
          {typeof title === "string" ? <h3>{title}</h3> : title}
          {action}
        </div>
      )}
      <div className="mk-card__body">{children}</div>
      {footer && <div className="mk-card__foot">{footer}</div>}
    </section>
  );
}
