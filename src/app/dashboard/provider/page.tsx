"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function ProviderDashboard() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    const defaultLocation = { lat: 19.076, lng: 72.877 }; // Mumbai
    const mapElement = document.getElementById("map") as HTMLElement;
    if (!mapElement || map) return;

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
    const file = formData.get("foodImage") as File;

    if (!file || file.size === 0) {
      alert("Please upload a food image.");
      return;
    }

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData, // Upload image first
      });

      if (!uploadRes.ok) throw new Error("Image upload failed.");
      const { imageUrl } = await uploadRes.json();

      const foodData = {
        foodName: formData.get("foodName"),
        foodCategory: formData.get("foodCategory"),
        amount: formData.get("amount"),
        pickupLocation: formData.get("pickupLocation"),
        foodImage: imageUrl, // Store the uploaded image URL
      };

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
      } else {
        console.error("Failed to submit food data.");
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
