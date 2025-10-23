"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export interface SourcingList {
  id: string;
  name: string;
  createdAt: Timestamp;
}

/**
 * 🔹 useSourcingLists
 * Fetches and manages all sourcing lists for a given client.
 */
export function useSourcingLists(clientId: string) {
  const [lists, setLists] = useState<SourcingList[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Memoize the Firestore reference
  const listRef = useMemo(
    () => collection(db, "clients", clientId, "sourcingLists"),
    [clientId]
  );

  useEffect(() => {
    if (!clientId) return;

    const q = query(listRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<SourcingList, "id">),
        }));
        setLists(all);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Error loading sourcing lists:", err);
        toast.error("Failed to load sourcing lists.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [clientId, listRef]);

  const addList = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        await addDoc(listRef, {
          name: trimmed,
          createdAt: Timestamp.now(),
        });
        toast.success("Sourcing list created!");
      } catch (err) {
        console.error("❌ Error creating sourcing list:", err);
        toast.error("Failed to create sourcing list.");
      }
    },
    [listRef]
  );

  return { lists, loading, addList };
}
