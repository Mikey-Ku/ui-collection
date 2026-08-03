import type { ButtonHTMLAttributes } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square button for a single glyph. Pass an aria-label with it. */
  icon?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "mk-btn",
        `mk-btn--${variant}`,
        size !== "md" && `mk-btn--${size}`,
        icon && "mk-btn--icon",
        className
      )}
      {...rest}
    />
  );
}
