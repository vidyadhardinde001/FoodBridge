// dashboard/provider/page.tsx

"use client";
import { useEffect, useState } from "react";
import React from "react";
import { MessageCircle } from "lucide-react"; // Import Lucide icon
import Link from "next/link"; // If using Next.js
import { getSocket } from "@/lib/socket-client";
import FoodList from "@/sections/FoodList";

declare global {
  interface Window {
    google: any;
  }
}

export default function ProviderDashboard() {
  const socket = getSocket();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [foods, setFoods] = useState([]);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [chats, setChats] = useState([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/food?provider=true", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setFoods(data);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };
    fetchFoods();

    const fetchChats = async () => {
      const res = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`,
        "X-User-Role": "provider"
       }
      });
      const data = await res.json();
      setChats(data);
    };
    
    fetchChats();

    // Listen for new messages
    socket?.on("new-message", (message) => {
      setChats(prevChats => prevChats.map(chat => 
        chat._id === message.chatId ? 
        { ...chat, messages: [...chat.messages, message] } : 
        chat
      ));
    });

    // Listen for new food listings
    socket?.on("new-food-added", (newFood) => {
      setFoods(prev => [newFood, ...prev]);
    });

    return () => {
      socket?.off("new-food-added");
      socket?.off("new-message");
    };
  }, []);

  const initializeMap = () => {
    const defaultLocation = { lat: 19.076, lng: 72.877 }; // Mumbai
    const mapElement = document.getElementById("map") as HTMLElement;
    if (!mapElement) return;

    const newMap = new window.google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 12,
    });
    setMap(newMap);

    const newMarker = new window.google.maps.Marker({
      position: defaultLocation,
      map: newMap,
    });
    setMarker(newMarker);
  };

  const toggleSection = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // const foodData = Object.fromEntries(formData.entries());
    const foodData = {
      foodName: formData.get('foodName'),
      foodCategory: formData.get('foodCategory'),
      quantity: formData.get('amount'),
      pickupLocation: formData.get('pickupLocation'),
      description: 'Food donation', // Add description field to form
      imageUrl: formData.get('foodImage')?.toString() // Implement image upload logic
    };
    console.log(foodData);

    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(foodData),
      });

      if (res.ok) {
        const newFood = await res.json();
        setFoods([newFood, ...foods]);
        setExpanded(null);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Provider Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login";
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => toggleSection("addFood")}
          className="p-3 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition"
        >
          Add Surplus Food ➕
        </button>
        {/* Chat Button */}
        <Link href="/chat">
          <button
            className="p-3 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition"
          >
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Messages
          </button>
        </Link>
      </div>



      {expanded === "addFood" && (
        <section className="p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Surplus Food</h3>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Food Name</label>
              <input
                type="text"
                name="foodName"
                placeholder="Enter food name"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Food Category</label>
              <select
                name="foodCategory"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                <option value="">Select category...</option>
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Cooked Meals">Cooked Meals</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Upload Food Image</label>
              <input
                type="file"
                name="foodImage"
                accept="image/*"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Amount (kg)</label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount in kg"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Pickup Location</label>
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter Pickup Location"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Location Map</label>
              <div id="map" className="w-full h-64 border rounded-lg shadow-md"></div>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Submit
            </button>
          </form>
        </section>
      )}
    </>
  );
}
