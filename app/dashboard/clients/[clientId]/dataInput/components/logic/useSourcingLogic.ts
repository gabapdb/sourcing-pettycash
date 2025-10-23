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
  setDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { useEffect, useState, useCallback, useMemo } from "react";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { calcTotal, calcGrandTotal } from "../areaItemsTable/tableUtils";

/**
 * 🔹 Represents one sourcing item
 */
export interface SourcingItem {
  id: string;
  uuidSL: string;
  store: string;
  item: string;
  itemName: string;
  quantity: number;
  unit: string;
  type: string;
  dimensions: string;
  approved: boolean;
  movedToPettyCash?: boolean;
  notApproved: boolean;
  notes?: string;
  price: number;
  total: number;
  createdAt: Timestamp;
}

/**
 * 🔹 Editable fields in the sourcing table
 */
export type EditableField = keyof Pick<
  SourcingItem,
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
 * 🔹 Hook: useSourcingLogic
 * Handles sourcing CRUD, approvals, and auto-move to Petty Cash.
 */
export function useSourcingLogic(clientId: string, sourcingListId: string) {
  const [items, setItems] = useState<SourcingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Memoized Firestore references
  const sourcingRef = useMemo(() => {
    if (!clientId || !sourcingListId) return null;
    return collection(
      db,
      "clients",
      clientId,
      "sourcingLists",
      sourcingListId,
      "items"
    );
  }, [clientId, sourcingListId]);

  const pettyCashRef = useMemo(
    () => collection(db, "clients", clientId, "pettyCashItems"),
    [clientId]
  );

  // 🔹 Live Firestore listener
  useEffect(() => {
    if (!sourcingRef) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(sourcingRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as Omit<SourcingItem, "id">;
          return { id: d.id, ...data };
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore sourcing listener error:", err);
        toast.error("Failed to sync sourcing items.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [sourcingRef]);

  // 🔹 Add new item
  const addItem = useCallback(
    async (data: Partial<SourcingItem>) => {
      if (!sourcingRef) return;
      try {
        const quantity = Number(data.quantity) || 0;
        const price = Number(data.price) || 0;
        const total = calcTotal(quantity, price);

        await addDoc(sourcingRef, {
          uuidSL: uuidv4(),
          store: data.store || "",
          item: data.item || "",
          itemName: data.itemName || "",
          quantity,
          unit: data.unit || "",
          type: data.type || "",
          dimensions: data.dimensions || "",
          approved: false,
          notApproved: false,
          movedToPettyCash: false,
          notes: data.notes || "",
          price,
          total,
          createdAt: Timestamp.now(),
        });

        toast.success("Item added successfully!");
      } catch (err) {
        console.error("❌ Error adding sourcing item:", err);
        toast.error("Failed to add item.");
      }
    },
    [sourcingRef]
  );

  // 🔹 Update field
  const updateItem = useCallback(
    async (id: string, field: EditableField, value: string) => {
      if (!sourcingRef) return;
      try {
        const ref = doc(sourcingRef, id);
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
        console.error("❌ Error updating sourcing item:", err);
        toast.error("Failed to update item.");
      }
    },
    [sourcingRef, items]
  );

  // 🔹 Delete item
  const deleteItem = useCallback(
    async (id: string) => {
      if (!sourcingRef) return;
      try {
        await deleteDoc(doc(sourcingRef, id));
        toast.success("Item deleted");
      } catch (err) {
        console.error("❌ Error deleting sourcing item:", err);
        toast.error("Failed to delete item.");
      }
    },
    [sourcingRef]
  );

  // 🔹 Approve/Unapprove and move to Petty Cash
  const toggleApproval = useCallback(
    async (id: string, field: "approved" | "notApproved") => {
      if (!sourcingRef) return;
      try {
        const ref = doc(sourcingRef, id);
        const item = items.find((it) => it.id === id);
        if (!item) return;

        const isApproving = field === "approved";
        const newValue = !item[field];

        // Update in sourcing
        await updateDoc(ref, {
          [field]: newValue,
          ...(isApproving ? { notApproved: false } : { approved: false }),
          movedToPettyCash: isApproving ? newValue : false,
        });

        // ✅ Move to petty cash if approved
        if (isApproving && newValue) {
          const uuidPC = uuidv4();
          await setDoc(doc(pettyCashRef, uuidPC), {
            uuidSL: item.uuidSL,
            uuidPC,
            store: item.store,
            item: item.item,
            itemName: item.itemName,
            quantity: item.quantity,
            unit: item.unit,
            type: item.type,
            dimensions: item.dimensions,
            notes: item.notes,
            price: item.price,
            total: item.total,
            processed: false,
            paid: false,
            fromSourcingList: sourcingListId,
            createdAt: Timestamp.now(),
          });
        }

        // ❌ Remove from petty cash if unapproved
        if (isApproving && !newValue) {
          const q = query(pettyCashRef, where("uuidSL", "==", item.uuidSL));
          const snapshot = await getDocs(q);
          snapshot.forEach(async (d) => {
            await deleteDoc(doc(pettyCashRef, d.id));
          });
        }
      } catch (err) {
        console.error("❌ Error toggling approval:", err);
        toast.error("Failed to update approval state.");
      }
    },
    [sourcingRef, pettyCashRef, items, sourcingListId]
  );

  const grandTotal = calcGrandTotal(items);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleApproval,
    grandTotal,
  };
}
