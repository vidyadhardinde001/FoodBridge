// dashboard/provider/page.tsx

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
  coordinates: {
    lat: number;
    lng: number;
  }; // Added coordinates field
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
  const [error, setError] = useState<string | null>(null); // Added error state
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, [socket]);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`; // Added API key
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/food?provider=true", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
            "X-User-Role": "provider",
          },
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
      setFoods((prev) => [newFood, ...prev]);
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

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status !== 'OK' || !data.results[0]) {
        throw new Error(data.error_message || 'No results found');
      }
      return data.results[0].geometry.location;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
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

      const pickupLocation = formData.get("pickupLocation") as string;
      const coordinates = await geocodeAddress(pickupLocation); // Added geocoding

      if (!pickupLocation || pickupLocation.trim().length < 5) {
        throw new Error("Please enter a valid address");
      }

      const foodData = {
        foodName: formData.get("foodName"),
        foodCategory: formData.get("foodCategory"),
        foodType: formData.get("foodType"),
        quantity: formData.get("amount"),
        pickupLocation: formData.get("pickupLocation"),
        description: formData.get("description"),
        imageUrl: imageUrl,
        coordinates,
        foodCondition: formData.get("foodCondition"),
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

  // In provider/page.tsx
  const handleConfirm = async (requestId: string) => {
    if (confirm("Are you sure you want to confirm this request?")) {
      try {
        await fetch(`/api/requests/${requestId}/confirm`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } catch (error) {
        console.error("Confirmation failed:", error);
      }
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Please enter reason for rejection:");
    if (reason) {
      try {
        await fetch(`/api/requests/${requestId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ reason })
        });
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } catch (error) {
        console.error("Rejection failed:", error);
      }
    }
  };

  return (
    <div
      className="min-h-screen items-center justify-center p-6 relative"
      style={{
        backgroundImage: "url('/provider.png')", // Replace with your image path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-white">Welcome!</h1>

        <div className="flex items-center gap-4">
          <Link href="/chat">
            <button className="p-3 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </button>
          </Link>

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
        </div>
      </header>


      <div className="grid grid-cols-3 gap-4 mt-2">
        <button
          onClick={() => toggleSection("addFood")}
          className="p-3 bg-white shadow-lg rounded-lg flex items-center justify-center gap-2 text-lg font-medium border border-gray-300 hover:bg-gray-100 transition"
        >
          Add Surplus Food ➕
        </button>
      </div>

      <section className="mt-4 mb-4 p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-medium">Pending Requests</h3>
        {requests.map(request => (
          <div key={request._id} className="p-4 mb-4 border rounded-lg">
            <p>{request.message}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleConfirm(request._id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      {expanded === "addFood" && (
        <section className="p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Add Surplus Food
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Food Name
              </label>
              <input
                type="text"
                name="foodName"
                placeholder="Enter food name"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter food description"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Food Category
              </label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Food Type
              </label>
              <select
                name="foodType"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                <option value="">Select type...</option>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Food Image
              </label>
              <input
                type="file"
                name="foodImage"
                accept="image/*"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Food Condition
              </label>
              <select
                name="foodCondition"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                <option value="">Select condition...</option>
                <option value="used">Used</option>
                <option value="unused">Unused</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount (kg)
              </label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount in kg"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                name="pickupLocation"
                placeholder="Enter Pickup Location"
                className="w-full p-3 bg-gray-50 border border-teal-500 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location Map
              </label>
              <div
                id="map"
                className="w-full h-64 border rounded-lg shadow-md"
              ></div>
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
            <div className="text-4xl mb-4">🎉</div>{" "}
            {/* Emoji for celebration */}
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Submitted Successfully!
            </h2>
            <p className="text-gray-600">
              Your food donation has been recorded.
            </p>
          </div>
        </div>
      )}
     </div>
  );
}
