"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import SourcingListTab from "./tabs/sourcingListTab";
import PettyCashTab from "./tabs/pettyCashTab";
import LiquidationTab from "./tabs/liquidationTab";

const TABS = ["Sourcing List", "Petty Cash", "Liquidation"] as const;
type TabType = (typeof TABS)[number];

export default function DataInput({ onBack }: { onBack: () => void }) {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("Sourcing List");

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-600 underline">
        ← Back to Folders
      </button>

      <h1 className="text-2xl font-semibold mb-6">
        Data Input for Client: {clientId}
      </h1>

      <div className="flex gap-2 mb-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="border rounded-xl p-6 bg-white shadow-sm">
        {activeTab === "Sourcing List" && <SourcingListTab clientId={clientId} />}
        {activeTab === "Petty Cash" && <PettyCashTab clientId={clientId} />}
        {activeTab === "Liquidation" && <LiquidationTab clientId={clientId} />}
      </div>
    </div>
  );
}
