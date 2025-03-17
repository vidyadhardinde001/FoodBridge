"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Profile from "@/app/profile/page";
import { FaUserCircle } from "react-icons/fa";
import { connectSocket } from "@/lib/socket-client";

const Navbar = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (e.g., using local storage or cookies)
    const token = localStorage.getItem("authToken"); // Replace with a secure auth check
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear authentication
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 w-full bg-white shadow-md">
      {/* Logo or Branding */}
      <div
        className="text-2xl font-bold text-gray-700 cursor-pointer"
        onClick={() => router.push("/")}
      >
        IngredientIQ
      </div>

      {/* Navigation Links */}
      <div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          >
            Logout
          </button>
        ) : (
          <div className="flex space-x-4 items-center">
            <FaUserCircle
      className="w-8 h-8 text-blue-500 hover:text-purple-600 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110"
      onClick={() => router.push("/profile")}
    />
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md 
               hover:from-purple-600 hover:to-blue-500 hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-md 
               hover:from-purple-600 hover:to-blue-500 hover:scale-105 transition-transform duration-300 ease-in-out"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
