"use client";
import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaHome, 
  FaInfoCircle, 
  FaChartBar, 
  FaEnvelope, 
  FaListAlt, 
  FaUser,
  FaBell,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt
} from "react-icons/fa";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    setRole(userRole);
    const path = window.location.pathname;

    if (!token || !userRole) {
      router.push("/login");
    }

    if (path.startsWith("/dashboard/provider") && userRole !== "provider") {
      router.push("/dashboard/charity");
    }
    if (path.startsWith("/dashboard/charity") && userRole !== "charity") {
      router.push("/dashboard/provider");
    }
  }, [router]);

  if (!role) return null; // Show loading state if needed

  return (
    <html lang="en">
      <body className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-gray-50">
        <div className="flex h-screen z-50  ">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 z-10 text-white transition-all duration-300 flex flex-col`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-700 z-20">
              {sidebarOpen ? (
                <h1 className="text-xl font-bold">Dashboard</h1>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              )}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 rounded-lg hover:bg-gray-700"
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>  

            <nav className="flex-1 overflow-y-auto">
              {/* Common Navigation */}
              <Link 
                href={`/dashboard/${role}`} 
                className="flex items-center p-4 hover:bg-gray-700 transition-colors"
              >
                <FaHome className="text-lg" />
                {sidebarOpen && <span className="ml-3">Home</span>}
              </Link>

              {/* Role-Specific Navigation */}
              {role === 'charity' && (
                <>
                  <Link 
                    href="/dashboard/charity/profile" 
                    className="flex items-center p-4 hover:bg-gray-700 transition-colors"
                  >
                    <FaUser className="text-lg" />
                    {sidebarOpen && <span className="ml-3">Profile</span>}
                  </Link>


                  <Link 
                    href="/providers" 
                    className="flex items-center p-4 hover:bg-gray-700 transition-colors"
                  >
                    <FaUsers className="text-lg" />
                    {sidebarOpen && <span className="ml-3">Providers</span>}
                  </Link>

                </>
              )}

              {role === 'provider' && (
                <Link 
                  href="/dashboard/provider/profile" 
                  className="flex items-center p-4 hover:bg-gray-700 transition-colors"
                >
                  <FaUser className="text-lg" />
                  {sidebarOpen && <span className="ml-3">Profile</span>}
                </Link>
              )}
            </nav>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                router.push("/login");
              }}
              className="flex items-center p-4 mt-auto hover:bg-gray-700 transition-colors text-red-400"
            >
              <FaSignOutAlt className="text-lg" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto z-">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}