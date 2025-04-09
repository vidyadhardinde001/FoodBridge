// dashboard/provider/page.tsx

"use client";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket-client";
import { MessageCircle, X, Plus, LogOut, Check, XCircle } from "lucide-react";
import { UserCircleIcon } from '@heroicons/react/24/outline';

declare global {
  interface Window {
    google: any;
  }
}

type Chat = {
  _id: string;
  messages: any[];
};

type Message = {
  _id: string;
  chatId: string;
  content: string;
};

type Food = {
  _id: string;
  foodName: string;
  foodCategory: string;
  foodType: string;
  quantity: number;
  pickupLocation: string;
  pricingType: 'free' | 'paid';
  price?: number;
  description: string;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export default function ProviderDashboard() {
  const socket = getSocket();
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [pricingType, setPricingType] = useState<'free' | 'paid'>('free');

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
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

    socket?.on("new-message", (message: Message) => {
      setChats((prevChats: Chat[]) =>
        prevChats.map((chat) =>
          chat._id === message.chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
    });

    socket?.on("new-food-added", (newFood: Food) => {
      setFoods((prev) => [newFood, ...prev]);
    });

    return () => {
      socket?.off("new-food-added");
      socket?.off("new-message");
    };
  }, [socket]);

  const initializeMap = () => {
    const defaultLocation = { lat: 19.076, lng: 72.877 };
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
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("foodImage");

    if (!imageFile) {
      console.error("No image file provided");
      setIsLoading(false);
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", imageFile);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");
      const { imageUrl } = await uploadRes.json();

      const pickupLocation = formData.get("pickupLocation") as string;
      const coordinates = await geocodeAddress(pickupLocation);

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
        pricingType: formData.get("pricingType"),
        price: formData.get("price") ? Number(formData.get("price")) : undefined,
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
      setShowFoodModal(false);

      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 1500);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Provider Dashboard</h1>
          <p className="text-gray-600">Manage your food donations and requests</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/provider/profile"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <UserCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Profile</span>
          </Link>

          <Link 
            href="/chat"
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </Link>

          <button
            onClick={async () => {
              await fetch('/api/users/status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ isOnline: false })
              });
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowFoodModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Surplus Food</span>
          </button>
        </div>

        {/* Pending Requests Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {requests.length} pending
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending requests at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{request.message}</p>
                      <p className="text-sm text-gray-500 mt-1">Requested on: {new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(request._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Food Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Add Surplus Food</h3>
              <button 
                onClick={() => setShowFoodModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    name="foodName"
                    placeholder="e.g., Fresh Apples"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Category
                  </label>
                  <select
                    name="foodCategory"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Cooked Meals">Cooked Meals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe the food item..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Type
                  </label>
                  <select
                    name="foodType"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type
                  </label>
                  <select
                    name="pricingType"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    onChange={(e) => setPricingType(e.target.value as 'free' | 'paid')}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {pricingType === 'paid' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      min="0"
                      required={pricingType === 'paid'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter quantity in kg"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Condition
                  </label>
                  <select
                    name="foodCondition"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="used">Used</option>
                    <option value="unused">Unused</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    placeholder="Enter full address for pickup"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Map
                  </label>
                  <div
                    id="map"
                    className="w-full h-64 border border-gray-300 rounded-lg"
                  ></div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Image
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        name="foodImage" 
                        accept="image/*" 
                        className="hidden" 
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Submit Food"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-sm text-gray-500">
              Your food donation has been successfully submitted.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}