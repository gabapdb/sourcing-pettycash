"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { calcTotal, calcGrandTotal } from "./tableUtils";
import toast from "react-hot-toast";
import { useMemo } from "react";



/**
 * 🔹 ItemData
 * Represents one row in a sourcing/petty cash/liquidation table.
 */
export interface ItemData {
  id: string;
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

/**
 * 🔹 EditableField
 * Type-safe mapping for inline edits.
 */
export type EditableField = keyof Pick<
  ItemData,
  | "sourcingListNo"
  | "store"
  | "item"
  | "itemName"
  | "quantity"
  | "unit"
  | "type"
  | "dimensions"
  | "notes"
  | "price"
>;

/**
 * 🔹 useTableLogic
 * Handles all Firestore CRUD + live updates for area items.
 */
export function useTableLogic(
  clientId: string,
  areaId: string,
  basePath: string
) {
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);

 
  const collectionRef = useMemo(
  () => collection(db, "clients", clientId, basePath, areaId, "items"),
  [clientId, basePath, areaId]
);

  // 🔹 Live listener for Firestore changes
  useEffect(() => {
    if (!clientId || !areaId) return;

    const q = query(collectionRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as Omit<ItemData, "id">;
          return { id: d.id, ...data };
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore listener error:", err);
        toast.error("Failed to sync data with Firestore.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clientId, areaId, collectionRef]);

  // 🔹 Add new item
  const addItem = useCallback(
    async (data: Partial<ItemData>) => {
      try {
        const quantity = Number(data.quantity) || 0;
        const price = Number(data.price) || 0;
        const total = calcTotal(quantity, price);

        await addDoc(collectionRef, {
          sourcingListNo: Number(data.sourcingListNo) || 0,
          store: data.store || "",
          item: data.item || "",
          itemName: data.itemName || "",
          quantity,
          unit: data.unit || "",
          type: data.type || "",
          dimensions: data.dimensions || "",
          approved: false,
          notApproved: false,
          notes: data.notes || "",
          price,
          total,
          createdAt: Timestamp.now(),
        });

        toast.success("Item added successfully!");
      } catch (err) {
        console.error("❌ Error adding item:", err);
        toast.error("Failed to add item. Please try again.");
      }
    },
    [collectionRef]
  );

  // 🔹 Update field
  const updateItem = useCallback(
    async (id: string, field: EditableField, value: string) => {
      try {
        const ref = doc(collectionRef, id);
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
        toast.success("Updated successfully");
      } catch (err) {
        console.error("❌ Error updating item:", err);
        toast.error("Failed to update item.");
      }
    },
    [collectionRef, items]
  );

  // 🔹 Delete item
  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteDoc(doc(collectionRef, id));
        toast.success("Item deleted");
      } catch (err) {
        console.error("❌ Error deleting item:", err);
        toast.error("Failed to delete item.");
      }
    },
    [collectionRef]
  );
  

  // 🔹 Toggle approved / not approved
  const toggleCheckbox = useCallback(
    async (id: string, field: "approved" | "notApproved") => {
      try {
        const ref = doc(collectionRef, id);
        const item = items.find((it) => it.id === id);
        if (!item) return;

        const newValue = !item[field];
        await updateDoc(ref, {
          [field]: newValue,
          ...(field === "approved" && newValue ? { notApproved: false } : {}),
          ...(field === "notApproved" && newValue ? { approved: false } : {}),
        });
      } catch (err) {
        console.error("❌ Error toggling checkbox:", err);
        toast.error("Failed to update approval state.");
      }
    },
    [collectionRef, items]
  );

  // 🔹 Derived grand total
  const grandTotal = calcGrandTotal(items);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleCheckbox,
    grandTotal,
  };
}
