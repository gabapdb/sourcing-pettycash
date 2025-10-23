"use client";

import { useRouter } from "next/navigation";
import DataInput from "./dataInput";

/**
 * ClientPage
 * Renders the main DataInput workspace for a specific client.
 * Includes a back button to return to the main Clients dashboard.
 */
export default function ClientPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/clients");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DataInput onBack={handleBack} />
    </div>
  );
}
