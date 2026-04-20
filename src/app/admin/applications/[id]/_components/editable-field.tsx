"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "email" | "tel" | "date" | "textarea";
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await onSave(editValue);
        setIsEditing(false);
      } catch (err: any) {
        alert(err.message ?? "Failed to save");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-start gap-1.5">
          {type === "textarea" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="admin-input min-h-[60px] text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              className="admin-input text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending}
            />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="p-1.5 rounded-md hover:bg-green-50 text-green-600 transition-colors shrink-0"
            title="Save"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors shrink-0"
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group space-y-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">
          {value || <span className="text-muted-foreground italic">--</span>}
        </span>
        <button
          type="button"
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted text-muted-foreground transition-all"
          title={`Edit ${label}`}
        >
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
