import type React from "react";
import "./FormInput.css";

interface FormInputProps {
  id: string;
  label: string;
  type?: "text" | "password" | "email";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}

export function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  autoComplete,
  inputMode,
  maxLength,
}: FormInputProps) {
  return (
    <div className="form-input">
      <label className="form-input__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`form-input__field${error ? " form-input__field--invalid" : ""}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <p id={`${id}-error`} className="form-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
