// src/sections/Chats.tsx

"use client"; // Ensure it's a client component

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Initialize router
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);

    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("token");
      const updatedRole = localStorage.getItem("role");
      setIsLoggedIn(!!updatedToken);
      setUserRole(updatedRole);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("storage")); // Notify UI
    router.push("/");
  };

  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  return (
    <main className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-green-600">FoodBridge</h2>
        <nav className="mt-6">
          <a className="block p-3 bg-yellow-400 text-white rounded-lg mb-2">Home</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">About Us</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Features</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Analytics</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Contact</a>
        </nav>
      </aside>
      
      {/* Main Content */}
     <div className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="p-2 bg-gray-600 rounded-full text-white hover:bg-gray-700 transition"
              >
                👤
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
              )}
        </header>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button onClick={() => toggleSection("addFood")} className="p-4 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2">
            Add Surplus Food ➕
          </button>
          <button onClick={() => toggleSection("searchFood")} className="p-4 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2">
            Search Available Food 🔍
          </button>
          <button onClick={() => toggleSection("donate")} className="p-4 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2">
            Donate 💰
          </button>
        </div>
        
        {/* Expandable Sections */}
        {expanded === "addFood" && (
          <section className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold">Add Surplus Food</h3>
            <form className="mt-4 flex flex-col gap-3">
              <input type="text" placeholder="Food Name" className="p-2 border rounded-lg" />
              <input type="text" placeholder="Provider (Restaurant Name)" className="p-2 border rounded-lg" />
              <input type="text" placeholder="Quantity" className="p-2 border rounded-lg" />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Submit</button>
            </form>
          </section>
        )}
        
        {expanded === "searchFood" && (
          <section className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold">Search Available Food</h3>
            <input type="text" placeholder="Enter food name or location" className="p-2 border rounded-lg w-full mt-4" />
          </section>
        )}

        {expanded === "donate" && (
          <section className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold">Donate</h3>
            <form className="mt-4 flex flex-col gap-3">
              <input type="text" placeholder="Your Name" className="p-2 border rounded-lg" />
              <input type="number" placeholder="Donation Amount" className="p-2 border rounded-lg" />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Donate Now</button>
            </form>
          </section>
        )}
        
        {/* Background Image */}
        <div className="mt-6 rounded-lg overflow-hidden">
          <Image src="/background.png" alt="Food Donation" width={800} height={400} className="w-full h-auto" />
        </div>
      </div>
    </main>
  );
}