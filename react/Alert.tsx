import type { HTMLAttributes } from "react";
import { cx } from "./cx";
import type { Tone } from "./Badge";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Exclude<Tone, "accent">;
}

export function Alert({ tone = "neutral", className, children, ...rest }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("mk-alert", tone !== "neutral" && `mk-alert--${tone}`, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
