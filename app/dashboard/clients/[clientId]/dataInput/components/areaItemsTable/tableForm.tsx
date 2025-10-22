"use client";

import { useState, FormEvent } from "react";
import { tableClasses } from "./tableStyles";

interface TableFormProps {
  onAdd: (form: Record<string, string | number>) => Promise<void> | void;
}

/**
 * 🔹 TableForm
 * Handles item input only (UI layer).
 * Logic (addDoc, reload, etc.) is handled in tableLogic.ts.
 */
export default function TableForm({ onAdd }: TableFormProps) {
  const [form, setForm] = useState({
    sourcingListNo: "",
    store: "",
    item: "",
    itemName: "",
    quantity: "",
    unit: "",
    type: "",
    dimensions: "",
    notes: "",
    price: "",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.item || !form.itemName) return;
    await onAdd(form);
    setForm({
      sourcingListNo: "",
      store: "",
      item: "",
      itemName: "",
      quantity: "",
      unit: "",
      type: "",
      dimensions: "",
      notes: "",
      price: "",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-2 p-4 border-b border-gray-200 items-end bg-white rounded-t-lg"
    >
      <input
        value={form.sourcingListNo}
        onChange={(e) => setForm({ ...form, sourcingListNo: e.target.value })}
        placeholder="List #"
        type="number"
        className={`${tableClasses.input} w-24`}
        required
      />
      <input
        value={form.store}
        onChange={(e) => setForm({ ...form, store: e.target.value })}
        placeholder="Store"
        className={`${tableClasses.input} w-36`}
      />
      <input
        value={form.item}
        onChange={(e) => setForm({ ...form, item: e.target.value })}
        placeholder="Item"
        className={`${tableClasses.input} w-32`}
      />
      <input
        value={form.itemName}
        onChange={(e) => setForm({ ...form, itemName: e.target.value })}
        placeholder="Item Name"
        className={`${tableClasses.input} w-48`}
        required
      />
      <input
        value={form.quantity}
        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        placeholder="Qty"
        type="number"
        className={`${tableClasses.input} w-20`}
        required
      />
      <input
        value={form.unit}
        onChange={(e) => setForm({ ...form, unit: e.target.value })}
        placeholder="Unit"
        className={`${tableClasses.input} w-20`}
      />
      <input
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        placeholder="Type"
        className={`${tableClasses.input} w-32`}
      />
      <input
        value={form.dimensions}
        onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
        placeholder="Dimensions"
        className={`${tableClasses.input} w-36`}
      />
      <input
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        placeholder="Price"
        type="number"
        className={`${tableClasses.input} w-24`}
        required
      />
      <input
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        placeholder="Notes"
        className={`${tableClasses.input} w-48`}
      />
      <button type="submit" className={tableClasses.buttonPrimary}>
        Add
      </button>
    </form>
  );
}
