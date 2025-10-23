"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { calcTotal, calcGrandTotal } from "../areaItemsTable/tableUtils";

/**
 * Represents one petty cash item.
 */
export interface PettyCashItem {
  id: string;
  uuidSL: string;
  uuidPC: string;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  processed: boolean;
  paid: boolean;
  notes?: string;
  price: number;
  total: number;
  fromSourcingList?: string;
  createdAt: Timestamp;
}

/**
 * Editable fields for petty cash table.
 */
export type EditableField = keyof Pick<
  PettyCashItem,
  | "store"
  | "item"
  | "itemName"
  | "quantity"
  | "unit"
  | "type"
  | "dimensions"
  | "notes"
  | "price"
  | "processed"
  | "paid"
>;

/**
 * Hook: usePettyCashLogic
 * Handles Firestore CRUD for petty cash items only.
 */
export function usePettyCashLogic(clientId: string) {
  const [items, setItems] = useState<PettyCashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const pettyCashRef = useMemo(
    () => collection(db, "clients", clientId, "pettyCashItems"),
    [clientId]
  );

  // 🔹 Live listener
  useEffect(() => {
    if (!clientId) return;

    const q = query(pettyCashRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as Omit<PettyCashItem, "id">;
          return { id: d.id, ...data };
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore petty cash listener error:", err);
        toast.error("Failed to sync petty cash items.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clientId, pettyCashRef]);

  // 🔹 Add new item manually (rare)
  const addItem = useCallback(
    async (data: Partial<PettyCashItem>) => {
      try {
        const quantity = Number(data.quantity) || 0;
        const price = Number(data.price) || 0;
        const total = calcTotal(quantity, price);

        await addDoc(pettyCashRef, {
          uuidSL: data.uuidSL || "",
          uuidPC: crypto.randomUUID(),
          store: data.store || "",
          item: data.item || "",
          itemName: data.itemName || "",
          quantity,
          unit: data.unit || "",
          type: data.type || "",
          dimensions: data.dimensions || "",
          notes: data.notes || "",
          processed: false,
          paid: false,
          price,
          total,
          fromSourcingList: data.fromSourcingList || "",
          createdAt: Timestamp.now(),
        });

        toast.success("Item added to Petty Cash!");
      } catch (err) {
        console.error("❌ Error adding petty cash item:", err);
        toast.error("Failed to add petty cash item.");
      }
    },
    [pettyCashRef]
  );

  // 🔹 Update field
  const updateItem = useCallback(
    async (id: string, field: EditableField, value: string | boolean) => {
      try {
        const ref = doc(pettyCashRef, id);
        let updateData: Record<string, unknown> = { [field]: value };

        if (field === "quantity" || field === "price") {
          const existing = items.find((it) => it.id === id);
          if (existing) {
            const newQuantity =
              field === "quantity" ? Number(value) || 0 : existing.quantity;
            const newPrice =
              field === "price" ? Number(value) || 0 : existing.price;
            updateData = {
              ...updateData,
              total: calcTotal(newQuantity, newPrice),
            };
          }
        }

        await updateDoc(ref, updateData);
        toast.success("Item updated");
      } catch (err) {
        console.error("❌ Error updating petty cash item:", err);
        toast.error("Failed to update item.");
      }
    },
    [pettyCashRef, items]
  );

  // 🔹 Delete item
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(pettyCashRef, id));
        toast.success("Petty cash item deleted");
      } catch (err) {
        console.error("❌ Error deleting petty cash item:", err);
        toast.error("Failed to delete petty cash item.");
      }
    },
    [pettyCashRef]
  );

  // 🔹 Derived total
  const grandTotal = calcGrandTotal(items);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    grandTotal,
  };
}
