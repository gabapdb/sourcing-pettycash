"use client";

import { useState } from "react";
import { useDropdownConfig } from "./useDropdownConfig";
import { tableClasses } from "./tableStyles";
import { Plus, Loader2 } from "lucide-react";

interface DropdownManagerProps {
  clientId: string;
  configName: string; // e.g. "sourcingTypes" or "sourcingStores"
  defaultValues: string[];
  label: string; // For display: e.g. "Type" or "Store"
}

/**
 * 🔹 DropdownManager
 * Displays a list of dropdown options (live from Firestore)
 * + allows adding new ones with validation + toast feedback.
 */
export function DropdownManager({
  clientId,
  configName,
  defaultValues,
  label,
}: DropdownManagerProps) {
  const { options, loading, addOption } = useDropdownConfig(
    clientId,
    configName,
    defaultValues
  );
  const [newValue, setNewValue] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setAdding(true);
    await addOption(newValue);
    setNewValue("");
    setAdding(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-3">{label} Options</h3>

      {loading ? (
        <div className="flex items-center text-gray-500">
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Loading...
        </div>
      ) : (
        <ul className="text-sm space-y-1 mb-3">
          {options.map((opt) => (
            <li
              key={opt}
              className="border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-700"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={`Add new ${label.toLowerCase()}`}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className={`${tableClasses.input} w-full`}
          disabled={adding}
        />
        <button
          onClick={handleAdd}
          disabled={!newValue.trim() || adding}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-white transition ${
            adding
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {adding ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
