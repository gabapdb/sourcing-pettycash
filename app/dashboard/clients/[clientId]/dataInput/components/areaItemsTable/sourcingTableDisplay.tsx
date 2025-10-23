"use client";

import { EditableCell } from "./editableCell";
import { EditableDropdownCell } from "./editableDropdownCell";
import type { SourcingItem } from "../logic/useSourcingLogic";

interface SourcingTableDisplayProps {
  clientId: string;
  items: SourcingItem[];
  loading: boolean;
  onUpdate: (id: string, field: keyof SourcingItem, value: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, field: "approved" | "notApproved") => Promise<void>;
  grandTotal: number;
}

export default function SourcingTableDisplay({
  clientId,
  items,
  loading,
  onUpdate,
  onDelete,
  onToggle,
  grandTotal,
}: SourcingTableDisplayProps) {
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
      <table className="min-w-full text-sm border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-2 text-left">Store</th>
            <th className="p-2 text-left">Item</th>
            <th className="p-2 text-left">Item Name</th>
            <th className="p-2 text-left">Qty</th>
            <th className="p-2 text-left">Unit</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Dimensions</th>
            <th className="p-2 text-center">Approved</th>
            <th className="p-2 text-center">Not Approved</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right font-semibold">Total</th>
            <th className="p-2 text-center">🗑</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={13} className="p-4 text-center text-gray-500">
                Loading…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={13} className="p-4 text-center text-gray-400 italic">
                No items yet.
              </td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={it.id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <EditableDropdownCell
                    clientId={clientId}
                    configName="sourcingStores"
                    defaultValues={["Wilcon Depot", "AllHome", "CW Home Depot"]}
                    value={it.store ?? ""}
                    onSave={(val) => onUpdate(it.id, "store", val)}
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableCell
                    value={it.item ?? ""}
                    onSave={(val) => onUpdate(it.id, "item", val)}
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableCell
                    value={it.itemName ?? ""}
                    onSave={(val) => onUpdate(it.id, "itemName", val)}
                  />
                </td>

                <td className="p-2 w-20 text-black">
                  <EditableCell
                    type="number"
                    value={it.quantity ?? 0}
                    onSave={(val) => onUpdate(it.id, "quantity", val)}
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableCell
                    value={it.unit ?? ""}
                    onSave={(val) => onUpdate(it.id, "unit", val)}
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableDropdownCell
                    clientId={clientId}
                    configName="sourcingTypes"
                    defaultValues={["Electrical", "Finishing", "Plumbing"]}
                    value={it.type ?? ""}
                    onSave={(val) => onUpdate(it.id, "type", val)}
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableCell
                    value={it.dimensions ?? ""}
                    onSave={(val) => onUpdate(it.id, "dimensions", val)}
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={it.approved ?? false}
                    onChange={() => onToggle(it.id, "approved")}
                    className="h-4 w-4"
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={it.notApproved ?? false}
                    onChange={() => onToggle(it.id, "notApproved")}
                    className="h-4 w-4"
                  />
                </td>

                <td className="p-2 text-black">
                  <EditableCell
                    value={it.notes ?? ""}
                    onSave={(val) => onUpdate(it.id, "notes", val)}
                  />
                </td>

                <td className="p-2 text-right w-24 text-black">
                  ₱{Number(it.price ?? 0).toLocaleString()}
                </td>

                <td className="p-2 text-right font-semibold text-black">
                  ₱{Number(it.total ?? 0).toLocaleString()}
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() => onDelete(it.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>

        {!loading && items.length > 0 && (
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={10} className="p-2 text-right font-semibold">
                Grand Total:
              </td>
              <td className="p-2 font-bold text-right">
                ₱{grandTotal.toLocaleString()}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
