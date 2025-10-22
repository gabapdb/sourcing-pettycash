"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * 🔹 Reusable Firestore dropdown config hook
 *
 * Handles dynamic dropdown lists such as:
 * - sourcingTypes
 * - sourcingStores
 * - units
 *
 * Usage:
 * const { options, addOption, loading } = useDropdownConfig(
 *   clientId,
 *   "sourcingTypes",
 *   ["Electrical", "Plumbing", "Finishing"]
 * );
 */

export function useDropdownConfig(
  clientId: string,
  configName: "sourcingTypes" | "sourcingStores" | "units" | string,
  defaultValues: string[]
) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  /** 🔹 Load options from Firestore or create default config */
  const loadOptions = useCallback(async () => {
    const configRef = doc(db, "clients", clientId, "config", configName);

    try {
      const snap = await getDoc(configRef);

      if (!snap.exists()) {
        // Create document with default values
        await setDoc(configRef, { [getFieldName(configName)]: defaultValues });
        setOptions(defaultValues);
      } else {
        const data = snap.data() as Record<string, string[]>;
        const field = getFieldName(configName);
        setOptions(data[field] || defaultValues);
      }
    } catch (err) {
      console.error(`Error loading ${configName} config:`, err);
      setOptions(defaultValues);
    } finally {
      setLoading(false);
    }
  }, [clientId, configName, defaultValues]);

  /** 🔹 Add new dropdown option */
  const addOption = useCallback(
    async (newOption: string) => {
      const trimmed = newOption.trim();
      if (!trimmed || options.includes(trimmed)) return;

      const configRef = doc(db, "clients", clientId, "config", configName);
      const updated = [...options, trimmed];
      const field = getFieldName(configName);

      try {
        await updateDoc(configRef, { [field]: updated });
        setOptions(updated);
      } catch (err) {
        console.error(`Error updating ${configName} config:`, err);
      }
    },
    [clientId, configName, options]
  );

  /** 🔹 Auto-load config on mount */
  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  return { options, addOption, loading };
}

/** 🔹 Maps configName to its Firestore field key */
function getFieldName(configName: string): string {
  switch (configName) {
    case "sourcingTypes":
      return "types";
    case "sourcingStores":
      return "stores";
    case "units":
      return "units";
    default:
      return configName;
  }
}
