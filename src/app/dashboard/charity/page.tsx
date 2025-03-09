// app/dashboard/charity/page.tsx
"use client";
import { useState } from 'react';

export default function CharityDashboard() {
  const [search, setSearch] = useState('');

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Charity Dashboard</h1>
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

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search By location"
        className="w-full p-2 border rounded-lg mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Food Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-300 p-4 rounded-lg shadow">
            <p className="font-semibold">*Sample location</p>
            <p>*Provider name</p>
            <p>*Quantity</p>
          </div>
        ))}
      </div>
    </>
  );
}