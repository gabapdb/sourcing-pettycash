"use client";

import { useTableLogic } from "./tableLogic";
import TableForm from "./tableForm";
import TableDisplay from "./tableDisplay";
import { DropdownManager } from "./dropdownManager";
import { tableClasses } from "./tableStyles";

interface AreaItemsTableProps {
  clientId: string;
  areaId: string;
  basePath: "sourcingAreas" | "pettyCashAreas" | "liquidationAreas";
}

/**
 * 🔹 AreaItemsTable (Container)
 * Purely orchestrates logic + UI:
 * - Uses useTableLogic() for Firestore CRUD
 * - Renders dropdown config managers (Type, Store)
 * - Displays TableForm + TableDisplay
 */

const DEFAULT_TYPES = ["Electrical", "Plumbing", "Finishing", "Lighting"];
const DEFAULT_STORES = [
  "Wilcon Depot",
  "Handyman",
  "CW Home Depot",
  "AllHome",
  "True Value",
];

export default function AreaItemsTable({
  clientId,
  areaId,
  basePath,
}: AreaItemsTableProps) {
  const {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleCheckbox,
    grandTotal,
  } = useTableLogic(clientId, areaId, basePath);

  return (
    <div className={tableClasses.wrapper}>
      {/* 🔹 Config Managers */}
      <div className="flex flex-wrap gap-8 p-4 border-b border-gray-200 bg-gray-50">
        <DropdownManager
          clientId={clientId}
          configName="sourcingTypes"
          label="Type"
          defaultValues={DEFAULT_TYPES}
        />
        <DropdownManager
          clientId={clientId}
          configName="sourcingStores"
          label="Store"
          defaultValues={DEFAULT_STORES}
        />
      </div>

      {/* 🔹 Input Form */}
      <TableForm onAdd={addItem} />

      {/* 🔹 Data Table */}
      <TableDisplay
        clientId={clientId}
        items={items}
        loading={loading}
        onUpdate={updateItem}
        onDelete={deleteItem}
        onToggle={toggleCheckbox}
        grandTotal={grandTotal}
      />
    </div>
  );
}
