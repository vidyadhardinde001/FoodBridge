// app/dashboard/provider/page.tsx
"use client";
import { useState } from 'react';

export default function ProviderDashboard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => toggleSection('addFood')}
          className="p-4 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2"
        >
          Add Surplus Food ➕
        </button>
      </div>

      {/* Expandable Sections */}
      {expanded === 'addFood' && (
        <section className="p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold">Add Surplus Food</h3>
          <form className="mt-4 flex flex-col gap-3">
            <input type="text" placeholder="Food Name" className="p-2 border rounded-lg" />
            <input type="text" placeholder="Quantity" className="p-2 border rounded-lg" />
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Submit</button>
          </form>
        </section>
      )}
    </>
  );
}