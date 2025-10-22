"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppClientWorkspace from "./dataInput/index";

export default function ClientWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <AppClientWorkspace onBack={() => setShowApp(false)} />;
  }

  const folders = [
    { name: "Open App", icon: "📊", action: () => setShowApp(true) },
    {
      name: "Sourcing List Docs",
      icon: "📋",
      href: `/dashboard/clients/${clientId}/sourcing-list`,
    },
    {
      name: "Petty Cash Docs",
      icon: "💸",
      href: `/dashboard/clients/${clientId}/petty-cash`,
    },
    {
      name: "Liquidation Docs",
      icon: "🧾",
      href: `/dashboard/clients/${clientId}/liquidation`,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Client Workspace</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {folders.map((f) =>
          f.href ? (
            <Link
              key={f.name}
              href={f.href}
              className="flex flex-col items-center justify-center border rounded-xl p-6 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition"
            >
              <div className="text-5xl mb-3">{f.icon}</div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {f.name}
              </span>
            </Link>
          ) : (
            <button
              key={f.name}
              onClick={f.action}
              className="flex flex-col items-center justify-center border rounded-xl p-6 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition w-full"
            >
              <div className="text-5xl mb-3">{f.icon}</div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {f.name}
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
