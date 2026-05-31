import { ReactNode } from "react";
import { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  children: ReactNode;
  required?: boolean;
}

export function FormField({
  id,
  label,
  error,
  children,
  required = false,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
