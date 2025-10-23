"use client";

import { useState } from "react";
import { useSourcingLogic } from "../components/logic/useSourcingLogic";
import { useSourcingLists } from "../components/logic/useSourcingLists";
import TableDisplay from "../components/areaItemsTable/tableDisplay";
import TableForm from "../components/areaItemsTable/tableForm";

interface SourcingTabProps {
  clientId: string;
}

export default function SourcingListTab({ clientId }: SourcingTabProps) {
  const { lists, addList } = useSourcingLists(clientId);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  // ✅ Always call the hook, handle empty states inside it
  const sourcingLogic = useSourcingLogic(clientId, activeListId || "");

  return (
    <div className="space-y-6">
      {/* 🗂 Select or Add Sourcing List */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={activeListId || ""}
          onChange={(e) => setActiveListId(e.target.value || null)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a sourcing list...</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            const name = prompt("Enter new sourcing list name:");
            if (name) addList(name);
          }}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ➕ New List
        </button>
      </div>

      {/* 🧾 List Content */}
      {!activeListId ? (
        <div className="text-gray-500 italic">
          Select or create a sourcing list to begin.
        </div>
      ) : (
        <>
          <div className="border rounded-lg bg-white shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Add Item</h2>
            <TableForm onAdd={sourcingLogic.addItem} />
          </div>

          <div className="border rounded-lg bg-white shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">Sourcing List Items</h2>
            <TableDisplay
              clientId={clientId}
              items={sourcingLogic.items}
              loading={sourcingLogic.loading}
              onUpdate={sourcingLogic.updateItem}
              onDelete={sourcingLogic.deleteItem}
              onToggle={sourcingLogic.toggleApproval}
              grandTotal={sourcingLogic.grandTotal}
            />
          </div>
        </>
      )}
    </div>
  );
}
