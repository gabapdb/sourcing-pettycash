"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AreaItemsTable from "../components/areaItemsTable";

interface LiquidationTabProps {
  clientId: string;
}

export default function LiquidationTab({ clientId }: LiquidationTabProps) {
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAreas = useCallback(async () => {
    const ref = collection(db, "clients", clientId, "liquidationAreas");
    const snapshot = await getDocs(ref);
    const list = snapshot.docs.map((d) => ({
      id: d.id,
      name: (d.data().name as string) || "Untitled Area",
    }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    setAreas(list);
    if (list.length > 0 && !activeArea) setActiveArea(list[0].id);
    setLoading(false);
  }, [clientId, activeArea]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  if (loading) return <div>Loading areas...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Liquidation by Area</h2>

      <div className="flex flex-wrap items-center gap-2 mb-6 border-b pb-2">
        {areas.map((area) => (
          <button
            key={area.id}
            onClick={() => setActiveArea(area.id)}
            className={`px-4 py-1 text-sm font-medium border-b-2 ${
              activeArea === area.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {activeArea ? (
        <AreaItemsTable
          clientId={clientId}
          areaId={activeArea}
          basePath="liquidationAreas"
        />
      ) : (
        <p className="text-gray-500">Select an area to view liquidation data.</p>
      )}
    </div>
  );
}
