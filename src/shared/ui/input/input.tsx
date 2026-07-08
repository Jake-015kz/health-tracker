"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import styles from "./input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const classes = [styles.input, error ? styles.inputError : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={classes} {...props} />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
