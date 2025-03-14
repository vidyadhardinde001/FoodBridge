"use client";
import { useState, useEffect } from "react";

export default function CharityDashboard() {
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/food");
        if (!res.ok) throw new Error("Failed to fetch food data");
        const data = await res.json();
        setFoods(data);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };
    fetchFoods();
  }, []);

  const handleRequest = async (foodId: string) => {
    try {
      const res = await fetch(`/api/food/${foodId}/request`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        const updatedFood = await res.json();
        setFoods(foods.map((f) => (f._id === foodId ? updatedFood : f)));
      } else {
        const data = await res.json();
        console.error("Request failed:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Charity Dashboard</h1>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <input
          type="text"
          placeholder="Search by Location..."
          className="w-full p-2 border rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Food Cards Grid */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Available Food</h2>
        <div className="border-t my-2"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods
            .filter((food) =>
              food.pickupLocation.toLowerCase().includes(search.toLowerCase())
            )
            .filter((food) => food.status === "available")
            .map((food) => (
              <div
                key={food._id}
                className="bg-gray-50 p-4 rounded-lg shadow-md border relative"
              >
                {/* Veg/Non-Veg Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  

                  {/* Veg/Non-Veg Badge */}
                  <span
                    className={`px-2 py-1 text-sm font-semibold rounded ${
                      food.isVeg
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {food.isVeg ? "Veg" : "Non-Veg"}
                  </span>

                  {/* Checkbox */}
                  <input type="checkbox" className="w-5 h-5 accent-teal-600" />
                </div>

                {/* Food Name */}
                <h3 className="text-lg font-semibold">{food.foodName}</h3>

                {/* Food Image */}
                <div className="w-full h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt={food.foodName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">No Image Available</p>
                  )}
                </div>

                <p className="text-gray-600 font-semibold">Quantity:</p>
                <p className="text-green-600 text-2xl font-bold">
                  {" "}
                  {food.quantity}
                </p>

                <p className="text-gray-600 font-semibold">Provider:</p>
                    <p className="text-gray-600 bg-white">
                      {food.providerName}
                    </p>

                {/* View More Button */}
                <button
                  onClick={() =>
                    setExpandedFood(expandedFood === food._id ? null : food._id)
                  }
                  className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 ease-in-out"
                >
                  {expandedFood === food._id ? "View Less" : "View More"}
                </button>

                {/* Expanded Details */}
                {expandedFood === food._id && (
                  <div className="mt-2 border-t pt-2">
                    
                    <p className="text-gray-600 font-semibold">
                      Food description:{" "}
                    </p>
                    <p className="text-teal-700 bg-white">{food.description}</p>

                    {/* Location */}
                <p className="text-gray-600 font-semibold mt-2">Location:</p>
                <p className="text-teal-700 mt-2">{food.pickupLocation}</p>

                    {/* Map Placeholder */}
                    <div className="w-full h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center mt-2">
                      <p className="text-gray-400">Map Placeholder</p>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => handleRequest(food._id)}
                      className="mt-4 bg-teal-700 text-white px-4 py-2 rounded-lg w-full hover:bg-teal-800 transition"
                    >
                      Contact
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
