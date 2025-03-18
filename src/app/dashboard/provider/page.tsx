"use client";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link"; // If using Next.js
import { getSocket } from "@/lib/socket-client";
import { MessageCircle } from "lucide-react"; // Import the MessageCircle icon

declare global {
  interface Window {
    google: any;
  }
}

type Chat = {
  _id: string;
  messages: any[]; // Replace `any` with the actual message type if known
};

type Message = {
  _id: string;
  chatId: string;
  content: string; // Adjust based on actual message structure
};

type Food = {
  _id: string;
  foodName: string;
  foodCategory: string;
  foodType: string;
  quantity: number;
  pickupLocation: string;
  description: string;
  imageUrl: string;
};

export default function ProviderDashboard() {
  const socket = getSocket();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Success state

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
        if (!res.ok) throw new Error("Failed to fetch foods");
        const data = await res.json();
        setFoods(data);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chat", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "X-User-Role": "provider"
          }
        });
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchFoods();
    fetchChats();

    // Listen for new messages
    socket?.on("new-message", (message: Message) => {
      setChats((prevChats: Chat[]) =>
        prevChats.map((chat) =>
          chat._id === message.chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
    });

    // Listen for new food listings
    socket?.on("new-food-added", (newFood: Food) => {
      setFoods(prev => [newFood, ...prev]);
    });

    return () => {
      socket?.off("new-food-added");
      socket?.off("new-message");
    };
  }, [socket]);

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
    setIsLoading(true); // Start loading
  
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("foodImage");
  
    // Check if imageFile is null or undefined
    if (!imageFile) {
      console.error("No image file provided");
      setIsLoading(false); // Stop loading
      return; // Exit the function early if no file is provided
    }
  
    const uploadFormData = new FormData();
    uploadFormData.append("file", imageFile); // Now imageFile is guaranteed to be a valid Blob or string
  
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");
      const { imageUrl } = await uploadRes.json();
  
      const foodData = {
        foodName: formData.get("foodName"),
        foodCategory: formData.get("foodCategory"),
        foodType: formData.get("foodType"),
        quantity: formData.get("amount"),
        pickupLocation: formData.get("pickupLocation"),
        description: "Food donation",
        imageUrl: imageUrl,
      };
  
      const res = await fetch("/api/food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(foodData),
      });
  
      if (!res.ok) throw new Error("Failed to submit food data");
      const newFood = await res.json();
      setFoods([newFood, ...foods]);
      setExpanded(null);
  
      // Show success message
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 1500); // Hide after 3 seconds
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false); // Stop loading
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
              <label className="block text-gray-700 text-sm font-bold mb-2">Food Type</label>
              <select
                name="foodType"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                <option value="">Select type...</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
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
              disabled={isLoading} // Disable button during loading
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </section>


      )}
      {isSubmitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center animate-bounce">
            <div className="text-4xl mb-4">🎉</div> {/* Emoji for celebration */}
            <h2 className="text-2xl font-bold text-green-600 mb-2">Submitted Successfully!</h2>
            <p className="text-gray-600">Your food donation has been recorded.</p>
          </div>
        </div>
      )}
    </>
  );
}