/**
 * 🔹 tableStyles.ts
 * Centralized styling constants for all data input tables and forms.
 * 
 * Adjust Tailwind classes here to restyle your app globally.
 * Example: change color theme, font size, borders, spacing, etc.
 */

export const tableClasses = {
  // --- Layout containers ---
  wrapper: "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm",
  sectionTitle: "text-lg font-semibold mb-3 text-gray-800",
  table: "w-full text-sm border-collapse",
  headerRow: "bg-gray-100 border-b text-left text-gray-700 font-medium",
  row: "border-b hover:bg-gray-50 transition-colors",
  cell: "p-2 align-top text-gray-800",
  editableCell:
    "cursor-pointer min-h-[20px] hover:bg-blue-50 focus-within:bg-blue-50 rounded transition-colors",
  footerRow: "bg-gray-50 font-semibold text-right",

  // --- Form controls ---
  input:
    "border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition",
  select:
    "border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition",
  checkbox: "w-4 h-4 accent-blue-600 cursor-pointer",

  // --- Buttons ---
  buttonPrimary:
    "bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition active:scale-95",
  buttonSecondary:
    "bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition active:scale-95",
  buttonDanger:
    "text-red-600 hover:underline hover:text-red-800 text-sm transition",

  // --- Utility helpers ---
  badge:
    "px-2 py-0.5 text-xs rounded bg-gray-100 border border-gray-200 text-gray-700",
  totalCell: "p-2 font-semibold text-right text-gray-900",
};
