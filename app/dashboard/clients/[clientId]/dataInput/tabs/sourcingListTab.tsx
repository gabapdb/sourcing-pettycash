"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AreaItemsTable from "../components/areaItemsTable";

interface SourcingListTabProps {
  clientId: string;
}

/**
 * 🔹 sourcingListTab.tsx
 * Displays all sourcing areas as switchable tabs.
 */
export default function SourcingListTab({ clientId }: SourcingListTabProps) {
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [newAreaName, setNewAreaName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState<string | null>(null);

  /** 🔹 Load all areas for this client */
  const loadAreas = useCallback(async () => {
    try {
      const ref = collection(db, "clients", clientId, "sourcingAreas");
      const snapshot = await getDocs(ref);
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        name: (docSnap.data() as { name: string }).name,
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setAreas(list);
      if (list.length && !activeArea) setActiveArea(list[0].id);
    } catch (err) {
      console.error("Error loading sourcing areas:", err);
    } finally {
      setLoading(false);
    }
  }, [clientId, activeArea]);

  /** 🔹 Add new area */
  const handleAddArea = useCallback(async () => {
    const trimmed = newAreaName.trim();
    if (!trimmed) return;

    try {
      const ref = collection(db, "clients", clientId, "sourcingAreas");
      const newDoc = await addDoc(ref, { name: trimmed, createdAt: Timestamp.now() });
      setNewAreaName("");
      await loadAreas();
      setActiveArea(newDoc.id);
    } catch (err) {
      console.error("Error adding area:", err);
    }
  }, [clientId, newAreaName, loadAreas]);

  useEffect(() => {
    void loadAreas();
  }, [loadAreas]);

  if (loading) return <p className="text-gray-500">Loading areas…</p>;

  return (
    <div className="space-y-6">
      {/* 🔹 Add new area */}
      <div className="flex items-center gap-2 mb-2">
        <input
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          placeholder="Add new area..."
          className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddArea}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          + Add Area
        </button>
      </div>

      {/* 🔹 Tab navigation */}
      {areas.length > 0 && (
        <div className="flex gap-2 border-b border-gray-200">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveArea(area.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeArea === area.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      )}

      {/* 🔹 Display selected area table */}
      {activeArea ? (
        <div className="mt-4">
          <AreaItemsTable
            clientId={clientId}
            areaId={activeArea}
            basePath="sourcingAreas"
          />
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No areas yet. Add one above.</p>
      )}
    </div>
  );
}
