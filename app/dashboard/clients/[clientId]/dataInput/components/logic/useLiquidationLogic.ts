"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { calcGrandTotal, calcTotal } from "../areaItemsTable/tableUtils";

/** Represents one liquidation item row. */
export interface LiquidationItem {
  id: string;
  pettyCashRequestNo: string;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  notes?: string;
  price: number;
  total: number;
  purchasePrice: number;
  balance: number;
  changed: boolean;

  newItem?: string;
  newQuantity?: number;
  newUnit?: string;
  newDimensions?: string;
  newPrice?: number;
  newTotalPrice?: number;
  newPurchasePrice?: number;
  newBalance?: number;
  newNotes?: string;

  uuidSC?: string;
  uuidPC?: string;
  uuidLQ?: string;
  createdAt?: Timestamp;
}

/** Editable field names (for inline updates). */
export type EditableField = keyof Pick<
  LiquidationItem,
  | "store"
  | "item"
  | "itemName"
  | "quantity"
  | "unit"
  | "type"
  | "dimensions"
  | "notes"
  | "price"
  | "purchasePrice"
  | "balance"
  | "newItem"
  | "newQuantity"
  | "newUnit"
  | "newDimensions"
  | "newPrice"
  | "newTotalPrice"
  | "newPurchasePrice"
  | "newBalance"
  | "newNotes"
>;

/** Hook: useLiquidationLogic */
export function useLiquidationLogic(clientId: string) {
  const [items, setItems] = useState<LiquidationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionRef = collection(db, "clients", clientId, "liquidationItems");

  // 🔹 Load items live
  useEffect(() => {
    if (!clientId) return;

    const q = query(collectionRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: LiquidationItem[] = snapshot.docs.map((d) => {
          const data = d.data() as Omit<LiquidationItem, "id">;
          return { id: d.id, ...data };
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore listener error (Liquidation):", err);
        toast.error("Failed to sync liquidation data.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clientId, collectionRef]);

  // 🔹 Add new item manually
  const addItem = useCallback(
    async (data: Partial<LiquidationItem>) => {
      try {
        const quantity = Number(data.quantity) || 0;
        const price = Number(data.price) || 0;
        const total = calcTotal(quantity, price);

        await addDoc(collectionRef, {
          pettyCashRequestNo: data.pettyCashRequestNo || "",
          store: data.store || "",
          item: data.item || "",
          itemName: data.itemName || "",
          quantity,
          unit: data.unit || "",
          type: data.type || "",
          dimensions: data.dimensions || "",
          notes: data.notes || "",
          price,
          total,
          purchasePrice: Number(data.purchasePrice) || 0,
          balance: Number(data.balance) || 0,
          changed: false,
          createdAt: Timestamp.now(),
        });

        toast.success("Item added successfully!");
      } catch (err) {
        console.error("❌ Error adding liquidation item:", err);
        toast.error("Failed to add item.");
      }
    },
    [collectionRef]
  );

  // 🔹 Update field (handles recalculation)
  const updateItem = useCallback(
    async (id: string, field: EditableField, value: string) => {
      try {
        const ref = doc(collectionRef, id);
        const existing = items.find((it) => it.id === id);
        if (!existing) return;

        const updateData: Partial<LiquidationItem> = {
          [field]: value,
        };

        // Auto-recalculate totals if quantity or price change
        const numVal = Number(value);
        const quantity = field === "quantity" ? numVal : existing.quantity;
        const price = field === "price" ? numVal : existing.price;

        if (field === "quantity" || field === "price") {
          updateData.total = calcTotal(quantity, price);
        }

        await updateDoc(ref, updateData);
        toast.success("Updated successfully!");
      } catch (err) {
        console.error("❌ Error updating liquidation item:", err);
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
        console.error("❌ Error deleting liquidation item:", err);
        toast.error("Failed to delete item.");
      }
    },
    [collectionRef]
  );

  // 🔹 Toggle 'Changed' flag
  const toggleChanged = useCallback(
    async (id: string) => {
      try {
        const ref = doc(collectionRef, id);
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const newValue = !item.changed;
        await updateDoc(ref, { changed: newValue });
      } catch (err) {
        console.error("❌ Error toggling changed flag:", err);
        toast.error("Failed to toggle change state.");
      }
    },
    [collectionRef, items]
  );

  // 🔹 Derived grand total (for footer)
  const grandTotal = calcGrandTotal(items);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleChanged,
    grandTotal,
  };
}
