"use client";

import { useEffect } from "react";
import { usePettyCashLogic } from "../components/logic/usePettyCashLogic";
import { useParams } from "next/navigation";

interface PettyCashTabProps {
  clientId: string;
}

export default function PettyCashTab({ }: PettyCashTabProps) {
  const { clientId } = useParams<{ clientId: string }>();
  const { items, loading, updateItem, deleteItem, grandTotal } =
    usePettyCashLogic(clientId);

  useEffect(() => {
    if (!clientId) return;
  }, [clientId]);

  if (loading) return <div className="text-gray-600">Loading Petty Cash...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        Petty Cash Items
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No items in petty cash yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-left text-gray-700">
                <th className="p-2">Store</th>
                <th className="p-2">Item</th>
                <th className="p-2">Item Name</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Type</th>
                <th className="p-2">Dimensions</th>
                <th className="p-2">Notes</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2">Processed</th>
                <th className="p-2">Paid</th>
                <th className="p-2 text-center">✖</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{it.store}</td>
                  <td className="p-2">{it.item}</td>
                  <td className="p-2">{it.itemName}</td>
                  <td className="p-2 text-center">{it.quantity}</td>
                  <td className="p-2">{it.unit}</td>
                  <td className="p-2">{it.type}</td>
                  <td className="p-2">{it.dimensions}</td>
                  <td className="p-2">
                    <input
                      value={it.notes || ""}
                      onChange={(e) =>
                        updateItem(it.id, "notes", e.target.value)
                      }
                      placeholder="Notes"
                      className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                    />
                  </td>
                  <td className="p-2 text-right">
                    ₱{it.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right font-medium">
                    ₱{it.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Processed */}
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={it.processed}
                      onChange={() =>
                        updateItem(it.id, "processed", !it.processed)
                      }
                      className="h-4 w-4 accent-blue-600 cursor-pointer"
                    />
                  </td>

                  {/* Paid */}
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={it.paid}
                      onChange={() => updateItem(it.id, "paid", !it.paid)}
                      className="h-4 w-4 accent-green-600 cursor-pointer"
                    />
                  </td>


                  {/* Delete button */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteItem(it.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Totals footer */}
            <tfoot>
              <tr className="font-semibold bg-gray-50 border-t">
                <td colSpan={9} className="p-2 text-right">
                  Grand Total:
                </td>
                <td className="p-2 text-right text-blue-700">
                  ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={5}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
