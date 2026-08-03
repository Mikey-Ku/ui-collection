import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "./cx";

interface FieldShell {
  label: string;
  /** Sits under the control. Explain the consequence, not the format. */
  hint?: ReactNode;
}

/** Wraps a control with its label and hint, wiring ids and aria-describedby. */
function Field({
  label,
  hint,
  children,
}: FieldShell & { children: (ids: { id: string; describedBy?: string }) => ReactNode }) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="mk-field">
      <label className="mk-label" htmlFor={id}>
        {label}
      </label>
      {children({ id, describedBy: hint ? hintId : undefined })}
      {hint && (
        <span className="mk-hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}

export type InputProps = FieldShell &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    /** Tabular figures. Turn on for scores, thresholds, money. */
    numeric?: boolean;
  };

export function Input({ label, hint, numeric, className, ...rest }: InputProps) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          className={cx("mk-input", numeric && "mk-num", className)}
          {...rest}
        />
      )}
    </Field>
  );
}

export type SelectProps = FieldShell &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & { options: string[] };

export function Select({ label, hint, options, className, ...rest }: SelectProps) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <select id={id} aria-describedby={describedBy} className={cx("mk-select", className)} {...rest}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )}
    </Field>
  );
}

export type TextareaProps = FieldShell & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export function Textarea({ label, hint, className, ...rest }: TextareaProps) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <textarea id={id} aria-describedby={describedBy} className={cx("mk-textarea", className)} {...rest} />
      )}
    </Field>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Switch({ label, className, ...rest }: SwitchProps) {
  return (
    <label className={cx("mk-switch", className)}>
      <input type="checkbox" {...rest} />
      <span className="mk-switch__track" />
      {label}
    </label>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("mk-check", className)}>
      <input type="checkbox" {...rest} />
      {label}
    </label>
  );
}
