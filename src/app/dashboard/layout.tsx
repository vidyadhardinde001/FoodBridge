// dashboard/layout.tsx

"use client";
import { useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaInfoCircle, FaChartBar, FaEnvelope, FaListAlt, FaUser } from "react-icons/fa";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const path = window.location.pathname;
    if (!token || !role) {
      router.push("/login");
    }

    if (path.startsWith("/dashboard/provider") && role !== "provider") {
      router.push("/dashboard/charity");
    }
    if (path.startsWith("/dashboard/charity") && role !== "charity") {
      router.push("/dashboard/provider");
      }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 shadow-lg p-6 flex flex-col fixed h-full">
        <h2 className="text-3xl font-extrabold text-green-600 mb-6">FoodBridge</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            <FaHome className="mr-3" /> Home  
          </Link>
          <Link href="/about" className="flex items-center p-3 text-gray-700 hover:bg-gray-300 rounded-lg transition">
            <FaInfoCircle className="mr-3" /> About Us
          </Link>
          <Link href="/features" className="flex items-center p-3 text-gray-700 hover:bg-gray-300 rounded-lg transition">
            <FaListAlt className="mr-3" /> Features
          </Link>
          <Link href="/contact" className="flex items-center p-3 text-gray-700 hover:bg-gray-300 rounded-lg transition">
            <FaEnvelope className="mr-3" /> Contact
          </Link>
          <Link href="/profile" className="flex items-center p-3 text-gray-700 hover:bg-gray-300 rounded-lg transition">
            <FaUser className="mr-3" /> Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-10 ml-64 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
}
