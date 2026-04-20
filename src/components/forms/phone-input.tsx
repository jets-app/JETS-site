"use client";

import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";

function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "");

  // US format: (XXX) XXX-XXXX
  if (digits.length <= 10 && !value.startsWith("+")) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // International: +X XXX XXX XXXX
  if (digits.length <= 1) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
  if (digits.length <= 7) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
  return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

interface PhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    { onChange, className = "", placeholder = "(818) 831-3000", ...props },
    ref
  ) {
    const [display, setDisplay] = useState(props.defaultValue || props.value || "");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;
      const formatted = formatPhoneDisplay(raw);
      setDisplay(formatted);

      // Pass the formatted value back
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: formatted, name: e.target.name },
      };
      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }

    return (
      <Input
        ref={ref}
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder={placeholder}
        className={`h-10 ${className}`}
        {...props}
        value={display}
        onChange={handleChange}
      />
    );
  }
);
