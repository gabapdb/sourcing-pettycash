"use client";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

/**
 * 🔹 useDropdownConfig
 * Handles Firestore-backed dropdowns (e.g. Types, Stores)
 * Provides live sync, loading states, and safe add operations.
 */
export function useDropdownConfig(
  clientId: string,
  configName: string,
  defaultValues: string[]
) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Stable reference for Firestore collection
  const configRef = useMemo(
  () =>
    collection(
      db,
      "clients",
      clientId,
      "dropdownConfigs",
      configName,
      "options"
    ),
  [clientId, configName]
);


  // 🔹 Live Firestore listener
  useEffect(() => {
    if (!clientId || !configName) return;

    const q = query(configRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as { value: string };
          return data.value;
        });

        const combined = Array.from(new Set([...defaultValues, ...list]));
        setOptions(combined);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore dropdown listener error:", err);
        toast.error(`Failed to sync ${configName} options.`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clientId, configName, defaultValues, configRef]);

  // 🔹 Add new dropdown option
  const addOption = useCallback(
    async (newValue: string) => {
      const trimmed = newValue.trim();
      if (!trimmed) return;

      try {
        const exists = options.some(
          (opt) => opt.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) {
          toast.error(`"${trimmed}" already exists.`);
          return;
        }

        await addDoc(configRef, {
          value: trimmed,
          createdAt: Timestamp.now(),
        });

        toast.success(`Added new ${configName.slice(8).toLowerCase()}: "${trimmed}"`);
      } catch (err) {
        console.error(`❌ Error adding ${configName}:`, err);
        toast.error(`Failed to add ${configName}.`);
      }
    },
    [configRef, configName, options]
  );

  return { options, loading, addOption };
}
