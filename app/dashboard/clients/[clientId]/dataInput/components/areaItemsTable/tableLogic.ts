"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export interface ItemData {
  id: string;
  uuid: string;
  sourcingListNo: number;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  approved: boolean;
  notApproved: boolean;
  notes?: string;
  price: number;
  total: number;
  createdAt: Timestamp;
}

export type EditableField =
  | "sourcingListNo"
  | "store"
  | "item"
  | "itemName"
  | "quantity"
  | "unit"
  | "type"
  | "dimensions"
  | "notes"
  | "price";

/**
 * 🔹 useTableLogic()
 * Centralized Firestore + state manager for AreaItemsTable.
 * Returns data + CRUD methods for the UI layer to plug in.
 */
export function useTableLogic(
  clientId: string,
  areaId: string,
  basePath: "sourcingAreas" | "pettyCashAreas" | "liquidationAreas"
) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const ref = useMemo(
    () => collection(db, "clients", clientId, basePath, areaId, "items"),
    [clientId, basePath, areaId]
  );

  /** 🔹 Load all items */
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(ref);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ItemData, "id">),
      })) as ItemData[];

      list.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setItems(list);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }, [ref]);

  /** 🔹 Add a new item */
  const addItem = useCallback(
    async (form: Record<string, string | number>) => {
      try {
        const quantity = parseFloat(String(form.quantity));
        const price = parseFloat(String(form.price));
        const total = isFinite(quantity * price) ? quantity * price : 0;

        await addDoc(ref, {
          uuid: uuidv4(),
          sourcingListNo: parseInt(String(form.sourcingListNo)),
          store: form.store,
          item: form.item,
          itemName: form.itemName,
          quantity,
          unit: form.unit,
          type: form.type,
          dimensions: form.dimensions,
          approved: false,
          notApproved: false,
          notes: form.notes,
          price,
          total,
          createdAt: Timestamp.now(),
        });

        await loadItems();
      } catch (err) {
        console.error("Error adding item:", err);
      }
    },
    [ref, loadItems]
  );

  /** 🔹 Delete item */
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(ref, id));
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    },
    [ref]
  );

  /** 🔹 Update a single editable field */
  const updateItem = useCallback(
    async (id: string, field: EditableField, value: string) => {
      const current = items.find((i) => i.id === id);
      if (!current) return;

      let newValue: string | number = value;
      if (["quantity", "price", "sourcingListNo"].includes(field)) {
        newValue = parseFloat(value);
      }

      const updated: Partial<ItemData> = { [field]: newValue } as Partial<ItemData>;
      if (field === "quantity" || field === "price") {
        const q = field === "quantity" ? Number(newValue) : current.quantity;
        const p = field === "price" ? Number(newValue) : current.price;
        updated.total = q * p;
      }

      try {
        await updateDoc(doc(ref, id), updated);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
        );
      } catch (err) {
        console.error("Error updating item:", err);
      }
    },
    [ref, items]
  );

  /** 🔹 Toggle approved/notApproved checkboxes */
  const toggleCheckbox = useCallback(
    async (id: string, field: "approved" | "notApproved") => {
      const current = items.find((i) => i.id === id);
      if (!current) return;

      const updated: Partial<ItemData> =
        field === "approved"
          ? { approved: !current.approved, notApproved: false }
          : { notApproved: !current.notApproved, approved: false };

      try {
        await updateDoc(doc(ref, id), updated);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
        );
      } catch (err) {
        console.error("Error toggling checkbox:", err);
      }
    },
    [ref, items]
  );

  /** 🔹 Derived total */
  const grandTotal = useMemo(
    () => items.reduce((sum, i) => sum + (i.total || 0), 0),
    [items]
  );

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    addItem,
    deleteItem,
    updateItem,
    toggleCheckbox,
    grandTotal,
    reload: loadItems,
  };
}
