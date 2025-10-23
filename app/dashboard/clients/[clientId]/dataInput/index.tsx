"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import SourcingListTab from "./tabs/sourcingListTab";
import PettyCashTab from "./tabs/pettyCashTab";
import LiquidationTab from "./tabs/liquidationTab";
import { DropdownManager } from "./components/areaItemsTable/dropdownManager";

interface DataInputProps {
  onBack?: () => void;
}

export default function DataInput({ onBack }: DataInputProps) {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState<
    "Sourcing List" | "Petty Cash" | "Liquidation"
  >("Sourcing List");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-blue-600 underline text-sm hover:text-blue-700"
            >
              ← Back to Clients
            </button>
          )}
          <h1 className="text-2xl font-semibold">
            Data Input for Client:{" "}
            <span className="text-blue-600">{clientId}</span>
          </h1>
        </div>

        <button
          onClick={() => setShowSettings((v) => !v)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 border border-gray-300"
        >
          ⚙ Manage Dropdowns
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Dropdown Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownManager
              clientId={clientId}
              configName="sourcingTypes"
              defaultValues={["Electrical", "Finishing", "Plumbing"]}
              label="Type"
            />
            <DropdownManager
              clientId={clientId}
              configName="sourcingStores"
              defaultValues={["Wilcon Depot", "AllHome", "CW Home Depot"]}
              label="Store"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b">
        {["Sourcing List", "Petty Cash", "Liquidation"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        {activeTab === "Sourcing List" && <SourcingListTab clientId={clientId} />}
        {activeTab === "Petty Cash" && <PettyCashTab clientId={clientId} />}
        {activeTab === "Liquidation" && <LiquidationTab clientId={clientId} />}
      </div>
    </div>
  );
}
