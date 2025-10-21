"use client";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function HomePage() {
  useEffect(() => {
    async function test() {
      const snapshot = await getDocs(collection(db, "projects"));
      console.log("Projects:", snapshot.docs.map(d => d.data()));
    }
    test();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">SOURCING / PETTY CASH App</h1>
    </main>
  );
}
