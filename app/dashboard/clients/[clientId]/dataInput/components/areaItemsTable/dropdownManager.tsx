"use client";

import { useState } from "react";
import { useDropdownConfig } from "./useDropdownConfig";
import { tableClasses } from "./tableStyles";

interface DropdownManagerProps {
  clientId: string;
  configName: "sourcingTypes" | "sourcingStores" | "units" | string;
  label: string;
  defaultValues: string[];
}

/**
 * 🔹 DropdownManager
 * Controls Firestore-backed dropdown lists (Type, Store, etc.)
 * Compact and collapsible for a cleaner UI.
 */
export function DropdownManager({
  clientId,
  configName,
  label,
  defaultValues,
}: DropdownManagerProps) {
  const { options, addOption, loading } = useDropdownConfig(
    clientId,
    configName,
    defaultValues
  );
  const [newValue, setNewValue] = useState("");
  const [showList, setShowList] = useState(false);

  if (loading) return <p className="text-gray-500">Loading {label}s…</p>;

  async function handleAdd() {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    await addOption(trimmed);
    setNewValue("");
  }

  return (
    <div className="flex flex-col gap-1">
      {/* 🔹 Add new option input */}
      <div className="flex items-center gap-2">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add new ${label}…`}
          className={tableClasses.input + " w-48"}
        />
        <button
          onClick={handleAdd}
          className={tableClasses.buttonSecondary}
          title={`Add ${label}`}
        >
          + Add {label}
        </button>
        <button
          onClick={() => setShowList((prev) => !prev)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showList ? "Hide options" : "Show options"}
        </button>
      </div>

      {/* 🔹 Option list (collapsible) */}
      {showList && options.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1 max-h-20 overflow-y-auto text-sm text-gray-700">
          {options.map((opt) => (
            <span
              key={opt}
              className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200"
            >
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
