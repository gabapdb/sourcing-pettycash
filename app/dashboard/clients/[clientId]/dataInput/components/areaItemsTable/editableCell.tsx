"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { tableClasses } from "./tableStyles";

interface EditableCellProps {
  value: string | number | null | undefined;
  onSave: (newValue: string) => Promise<void> | void;
  type?: "text" | "number";
}

/**
 * 🔹 EditableCell (Safe version)
 * Prevents .toString() errors when value is null/undefined.
 */
export function EditableCell({
  value,
  onSave,
  type = "text",
}: EditableCellProps) {
  // ✅ Safely handle undefined/null values
  const safeValue = value != null ? value.toString() : "";

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(safeValue);

  useEffect(() => {
    setInputValue(safeValue);
  }, [safeValue]);

  async function handleSave() {
    setEditing(false);
    if (inputValue !== safeValue) {
      await onSave(inputValue);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditing(false);
      setInputValue(safeValue);
    }
  }

  if (editing) {
    return (
      <input
        type={type}
        autoFocus
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${tableClasses.input} w-full text-sm`}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={tableClasses.editableCell}
      title="Click to edit"
    >
      {type === "number"
        ? Number(value || 0).toLocaleString()
        : safeValue || ""}
    </div>
  );
}
