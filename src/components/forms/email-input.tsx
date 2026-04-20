"use client";

import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showValidation?: boolean;
  "aria-invalid"?: boolean;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput(
    {
      className = "",
      placeholder = "you@example.com",
      showValidation = true,
      onBlur,
      ...props
    },
    ref
  ) {
    const [touched, setTouched] = useState(false);
    const [valid, setValid] = useState<boolean | null>(null);

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setTouched(true);
      const val = e.target.value.trim();
      if (val.length === 0) {
        setValid(null);
      } else {
        setValid(emailRegex.test(val));
      }
      onBlur?.(e);
    }

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={placeholder}
          className={`h-10 pr-10 ${className}`}
          onBlur={handleBlur}
          {...props}
        />
        {showValidation && touched && valid !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  }
);
