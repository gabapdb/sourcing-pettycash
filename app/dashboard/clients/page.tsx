"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import Link from "next/link";
import { Client } from "@/lib/types";

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClientName, setNewClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientsRef = collection(db, "clients");

  useEffect(() => {
    let mounted = true;

    async function fetchClients() {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(clientsRef);
        const items: Client[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<{ name?: string; createdAt?: Timestamp }>) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name ?? "Unnamed",
              createdAt: data.createdAt ?? undefined,
            };
          }
        );
        if (mounted) setClients(items);
      } catch (err: unknown) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchClients();
    return () => {
      mounted = false;
    };
  }, [clientsRef]);

  async function addClient() {
    const name = newClientName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      const createdAt = Timestamp.now();
      const docRef = await addDoc(clientsRef, { name, createdAt });
      setClients((prev) => [{ id: docRef.id, name, createdAt }, ...prev]);
      setNewClientName("");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder="New client name"
          className="border px-3 py-1 rounded w-64"
        />
        <button
          onClick={addClient}
          disabled={adding}
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link href={`/dashboard/clients/${client.id}`} className="text-blue-600 underline">
                {client.name}
                {client.createdAt ? (
                  <span className="text-sm text-gray-500 ml-2">
                    ({client.createdAt.toDate().toLocaleString()})
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}