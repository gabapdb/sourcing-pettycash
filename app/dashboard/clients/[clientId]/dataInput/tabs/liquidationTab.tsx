"use client";

import { useParams } from "next/navigation";
import LiquidationTableDisplay from "../components/areaItemsTable/liquidationTableDisplay";
import { useLiquidationLogic } from "../components/logic/useLiquidationLogic";

export default function LiquidationTab() {
  const { clientId } = useParams<{ clientId: string }>();
  const {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleChanged,
    grandTotal,
  } = useLiquidationLogic(clientId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Liquidation</h2>
        <button
          onClick={() =>
            addItem({
              pettyCashRequestNo: "Auto",
              store: "",
              item: "",
              itemName: "",
              quantity: 0,
              unit: "",
              type: "",
              dimensions: "",
              notes: "",
              price: 0,
              total: 0,
              purchasePrice: 0,
              balance: 0,
            })
          }
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      <LiquidationTableDisplay
        items={items}
        loading={loading}
        onUpdate={updateItem}
        onDelete={deleteItem}
        onToggleChanged={toggleChanged}
      />
      <div className="text-right text-lg font-semibold">
        Grand Total: ₱{grandTotal.toLocaleString()}
      </div>
    </div>
  );
}
