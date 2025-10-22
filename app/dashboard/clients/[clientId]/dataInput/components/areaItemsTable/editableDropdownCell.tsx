"use client";

import { useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useDropdownConfig } from "./useDropdownConfig";

interface EditableDropdownCellProps {
  clientId: string;
  configName: "sourcingTypes" | "sourcingStores" | string;
  defaultValues: string[];
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  placeholder?: string;
}

/**
 * 🔹 EditableDropdownCell (Popover style)
 * Firestore-backed dropdown menu with “Add new…” option.
 */
export function EditableDropdownCell({
  clientId,
  configName,
  defaultValues,
  value,
  onSave,
  placeholder = "Select…",
}: EditableDropdownCellProps) {
  const { options, addOption, loading } = useDropdownConfig(
    clientId,
    configName,
    defaultValues
  );
  const [selected, setSelected] = useState(value || "");

  async function handleSelect(val: string) {
    if (val === "__add_new__") {
      const newVal = prompt(`Enter a new ${configName.slice(8).toLowerCase()}:`);
      if (!newVal) return;
      const trimmed = newVal.trim();
      if (!trimmed) return;
      await addOption(trimmed);
      setSelected(trimmed);
      await onSave(trimmed);
      return;
    }
    setSelected(val);
    await onSave(val);
  }

  return (
    <div className="relative">
      <Listbox value={selected} onChange={handleSelect}>
        {({ open }) => (
          <>
            <div
              className="relative w-full cursor-pointer"
              title="Click to change"
            >
              <Listbox.Button
                className={`relative w-full rounded-md border border-gray-300 bg-white py-1 pl-2 pr-6 text-left text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${!selected ? "text-gray-400" : ""}`}
              >
                <span>
                  {selected || (
                    <span className="text-gray-400">{placeholder}</span>
                  )}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                  <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>

              <Transition
                as={Fragment}
                show={open}
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  static
                  className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg focus:outline-none"
                >
                  {loading && (
                    <Listbox.Option
                      key="loading"
                      value=""
                      disabled
                      className="cursor-default select-none px-3 py-2 text-gray-400"
                    >
                      Loading…
                    </Listbox.Option>
                  )}

                  {!loading &&
                    options.map((opt) => (
                      <Listbox.Option
                        key={opt}
                        value={opt}
                        className={({ active }) =>
                          `relative cursor-pointer select-none px-3 py-2 ${
                            active ? "bg-blue-50 text-blue-700" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-medium" : "font-normal"
                              }`}
                            >
                              {opt}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-3 flex items-center text-blue-600">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}

                  {!loading && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      <Listbox.Option
                        key="add-new"
                        value="__add_new__"
                        className="cursor-pointer select-none px-3 py-2 text-blue-600 hover:bg-blue-50"
                      >
                        ➕ Add new…
                      </Listbox.Option>
                    </>
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  );
}
