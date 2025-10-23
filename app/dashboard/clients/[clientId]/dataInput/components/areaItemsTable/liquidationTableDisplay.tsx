"use client";

import { useState } from "react";
import type { Timestamp } from "firebase/firestore";
import type { EditableField } from "../logic/useLiquidationLogic";


// Shape of one liquidation row (no UUIDs rendered)
interface LiquidationItem {
  id: string;
  pettyCashRequestNo: string;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  notes?: string;
  price: number;
  total: number;
  purchasePrice: number;
  balance: number;

  changed: boolean;

  // Edited (new*) values — optional
  newItem?: string;
  newQuantity?: number;
  newUnit?: string;
  newDimensions?: string;
  newPrice?: number;
  newTotalPrice?: number;
  newPurchasePrice?: number;
  newBalance?: number;
  newNotes?: string;

  // Optional metadata (not rendered)
  createdAt?: Timestamp;
  uuidSC?: string;
  uuidPC?: string;
  uuidLQ?: string;
}

interface LiquidationTableDisplayProps {
  items: LiquidationItem[];
  loading: boolean;
    onUpdate: (
    id: string,
    field: EditableField,
    value: string
  ) => Promise<void>;

  onDelete: (id: string) => Promise<void>;
  onToggleChanged: (id: string) => Promise<void>;
}

/** Allowed cell value types coming from Firestore/JS */
type CellValue =
  | string
  | number
  | boolean
  | Timestamp
  | null
  | undefined;

/** Type guard for Firestore Timestamp */
function isTimestamp(v: unknown): v is Timestamp {
  return typeof v === "object" && v !== null && "toDate" in (v as object);
}

/** Convert any supported value to displayable text (for plain text cells) */
function toText(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (isTimestamp(value)) return value.toDate().toLocaleDateString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

/** Convert any supported value to a number (for money/qty cells) */
function toNumber(value: CellValue): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  // Booleans/Timestamps do not map to numeric amounts in this table
  return 0;
}

/** Capitalize helper for building new* field keys */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Compute the display value for a field, honoring per-row edited toggle */
function resolveValue(
  row: LiquidationItem,
  field: keyof LiquidationItem,
  showEdited: boolean
): CellValue {
  if (!showEdited) return row[field] as CellValue;

  const editedKey = (`new${capitalize(field as string)}`) as keyof LiquidationItem;
  const edited = row[editedKey] as CellValue;

  // If an edited value exists for this field, show it; otherwise fall back to original
  return edited ?? (row[field] as CellValue);
}

export default function LiquidationTableDisplay({
  items,
  loading,
  onUpdate,
  onDelete,
  onToggleChanged,
}: LiquidationTableDisplayProps) {
  const [toggledRows, setToggledRows] = useState<Record<string, boolean>>({});

  function toggleView(id: string): void {
    setToggledRows((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2 text-black text-left">Petty Cash #</th>
            <th className="p-2 text-black text-left">Store</th>
            <th className="p-2 text-black text-left">Item</th>
            <th className="p-2 text-black text-left">Item Name</th>
            <th className="p-2 text-black text-left">Qty</th>
            <th className="p-2 text-black text-left">Unit</th>
            <th className="p-2 text-black text-left">Type</th>
            <th className="p-2 text-black text-left">Dimensions</th>
            <th className="p-2 text-black text-left">Notes</th>
            <th className="p-2 text-black text-right">Price</th>
            <th className="p-2 text-black text-right">Total</th>
            <th className="p-2 text-black text-right">Purchase Price</th>
            <th className="p-2 text-black text-right">Balance</th>
            <th className="p-2 text-center">View</th>
            <th className="p-2 text-center">Changed</th>
            <th className="p-2 text-center">🗑</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={16} className="p-4 text-center text-gray-500">
                Loading…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={16} className="p-4 text-center text-gray-400 italic">
                No items yet.
              </td>
            </tr>
          ) : (
            items.map((it) => {
              const showEdited = !!toggledRows[it.id] && it.changed;
              const style = showEdited ? "text-blue-600 italic" : "";

              const text = (field: keyof LiquidationItem): string =>
                toText(resolveValue(it, field, showEdited));

              const money = (field: keyof LiquidationItem): string =>
                `₱${toNumber(resolveValue(it, field, showEdited)).toLocaleString()}`;

              const qty = (field: keyof LiquidationItem): string =>
                toNumber(resolveValue(it, field, showEdited)).toLocaleString();

              return (
                <tr key={it.id} className="border-b hover:bg-gray-50">
                  <td className={`p-2 ${style}`}>{toText(it.pettyCashRequestNo)}</td>
                  <td className={`p-2 ${style}`}>{text("store")}</td>
                  <td className={`p-2 ${style}`}>{text("item")}</td>
                  <td className={`p-2 ${style}`}>{text("itemName")}</td>
                  <td className={`p-2 ${style}`}>{qty("quantity")}</td>
                  <td className={`p-2 ${style}`}>{text("unit")}</td>
                  <td className={`p-2 ${style}`}>{text("type")}</td>
                  <td className={`p-2 ${style}`}>{text("dimensions")}</td>
                  <td className={`p-2 ${style}`}>{text("notes")}</td>

                  <td className={`p-2 text-right ${style}`}>{money("price")}</td>
                  <td className={`p-2 text-right ${style}`}>{money("total")}</td>
                  <td className={`p-2 text-right ${style}`}>{money("purchasePrice")}</td>
                  <td className={`p-2 text-right ${style}`}>{money("balance")}</td>

                  {/* Toggle view per row (only meaningful if changed) */}
                  <td className="p-2 text-center">
                    {it.changed ? (
                      <button
                        onClick={() => toggleView(it.id)}
                        className="text-blue-600 text-xs underline hover:text-blue-800"
                      >
                        {showEdited ? "View Original" : "View Edited"}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Changed checkbox */}
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={it.changed}
                      onChange={() => onToggleChanged(it.id)}
                      className="h-4 w-4"
                    />
                  </td>

                  {/* Delete */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => onDelete(it.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
