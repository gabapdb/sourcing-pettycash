"use client";

import { tableClasses } from "./tableStyles";
import { EditableCell } from "./editableCell";
import { EditableDropdownCell } from "./editableDropdownCell";
import { ItemData, EditableField } from "./tableLogic";
import { formatPeso } from "./tableUtils";

interface TableDisplayProps {
  clientId: string;
  items: ItemData[];
  loading: boolean;
  onUpdate: (id: string, field: EditableField, value: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, field: "approved" | "notApproved") => Promise<void>;
  grandTotal: number;
}

/**
 * 🔹 TableDisplay
 * Displays table rows for sourcing/petty cash/liquidation items.
 * "Store" and "Type" fields now use dropdown menus from Firestore config.
 */
export default function TableDisplay({
  clientId,
  items,
  loading,
  onUpdate,
  onDelete,
  onToggle,
  grandTotal,
}: TableDisplayProps) {
  if (loading) {
    return <p className="text-gray-500 p-4">Loading items…</p>;
  }

  if (items.length === 0) {
    return <p className="text-gray-500 p-4">No items yet.</p>;
  }

  return (
    <div className={tableClasses.wrapper}>
      <table className={tableClasses.table}>
        <thead>
          <tr className={tableClasses.headerRow}>
            {[
              "List #",
              "Store",
              "Item",
              "Item Name",
              "Qty",
              "Unit",
              "Type",
              "Dimensions",
              "Approved",
              "Not Approved",
              "Notes",
              "Price",
              "Total",
              "",
            ].map((header) => (
              <th key={header} className={tableClasses.cell}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((it) => (
            <tr key={it.id} className={tableClasses.row}>
              {/* List # */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.sourcingListNo}
                  type="number"
                  onSave={(v) => onUpdate(it.id, "sourcingListNo", v)}
                />
              </td>

              {/* Store - dropdown */}
              <td className={tableClasses.cell}>
                <EditableDropdownCell
                  clientId={clientId}
                  configName="sourcingStores"
                  defaultValues={[
                    "Wilcon Depot",
                    "Handyman",
                    "CW Home Depot",
                    "AllHome",
                    "True Value",
                  ]}
                  value={it.store}
                  onSave={(v) => onUpdate(it.id, "store", v)}
                />
              </td>

              {/* Item */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.item}
                  onSave={(v) => onUpdate(it.id, "item", v)}
                />
              </td>

              {/* Item Name */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.itemName}
                  onSave={(v) => onUpdate(it.id, "itemName", v)}
                />
              </td>

              {/* Quantity */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.quantity}
                  type="number"
                  onSave={(v) => onUpdate(it.id, "quantity", v)}
                />
              </td>

              {/* Unit */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.unit}
                  onSave={(v) => onUpdate(it.id, "unit", v)}
                />
              </td>

              {/* Type - dropdown */}
              <td className={tableClasses.cell}>
                <EditableDropdownCell
                  clientId={clientId}
                  configName="sourcingTypes"
                  defaultValues={[
                    "Electrical",
                    "Plumbing",
                    "Finishing",
                    "Lighting",
                  ]}
                  value={it.type}
                  onSave={(v) => onUpdate(it.id, "type", v)}
                />
              </td>

              {/* Dimensions */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.dimensions}
                  onSave={(v) => onUpdate(it.id, "dimensions", v)}
                />
              </td>

              {/* Checkboxes */}
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={it.approved}
                  onChange={() => onToggle(it.id, "approved")}
                  className={tableClasses.checkbox}
                />
              </td>
              <td className="text-center">
                <input
                  type="checkbox"
                  checked={it.notApproved}
                  onChange={() => onToggle(it.id, "notApproved")}
                  className={tableClasses.checkbox}
                />
              </td>

              {/* Notes */}
              <td className={tableClasses.cell}>
                <EditableCell
                  value={it.notes ?? ""}
                  onSave={(v) => onUpdate(it.id, "notes", v)}
                />
              </td>

              {/* Price + Total */}
              <td className={tableClasses.cell}>{formatPeso(it.price)}</td>
              <td className={tableClasses.totalCell}>{formatPeso(it.total)}</td>

              {/* Delete button */}
              <td className="text-center">
                <button
                  onClick={() => onDelete(it.id)}
                  className={tableClasses.buttonDanger}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {/* Grand Total Row */}
          <tr className={tableClasses.footerRow}>
            <td colSpan={12} className="p-2 text-right">
              Grand Total:
            </td>
            <td className={tableClasses.totalCell}>{formatPeso(grandTotal)}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
