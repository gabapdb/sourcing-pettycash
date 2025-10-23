"use client";

import { EditableCell } from "./editableCell";
import type { Timestamp } from "firebase/firestore";

export interface PettyCashItem {
  id: string;
  pettyCashRequestNo: string;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  processed: boolean;
  paid: boolean;
  notes?: string;
  price: number;
  total: number;
  createdAt?: Timestamp;
  uuidSL?: string;
  uuidPC?: string;
}

interface PettyCashTableDisplayProps {
  items: PettyCashItem[];
  loading: boolean;
  onUpdate: (
    id: string,
    field: keyof PettyCashItem,
    value: string
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, field: "processed" | "paid") => Promise<void>;
  grandTotal: number;
}

export default function PettyCashTableDisplay({
  items,
  loading,
  onUpdate,
  onDelete,
  onToggle,
  grandTotal,
}: PettyCashTableDisplayProps) {
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
            <th className="p-2 text-center">Processed</th>
            <th className="p-2 text-center">Paid</th>
            <th className="p-2 text-left">Notes</th>
            <th className="p-2 text-right">Price</th>
            <th className="p-2 text-right">Total</th>
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
                <td className="p-2 text-black">{it.store}</td>
                <td className="p-2 text-black">{it.item}</td>
                <td className="p-2 text-black">{it.itemName}</td>
                <td className="p-2 text-black">{it.quantity}</td>
                <td className="p-2 text-black">{it.unit}</td>
                <td className="p-2 text-black">{it.type}</td>
                <td className="p-2 text-black">{it.dimensions}</td>

                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={it.processed}
                    onChange={() => onToggle(it.id, "processed")}
                    className="h-4 w-4"
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={it.paid}
                    onChange={() => onToggle(it.id, "paid")}
                    className="h-4 w-4"
                  />
                </td>

                <td className="p-2 text-black">{it.notes ?? ""}</td>

                <td className="p-2 text-right text-black">
                  ₱{it.price.toLocaleString()}
                </td>
                <td className="p-2 text-black text-right font-semibold">
                  ₱{it.total.toLocaleString()}
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
      </table>
    </div>
  );
}
