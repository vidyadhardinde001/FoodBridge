// dashboard/charity/page.tsx

"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { connectSocket } from "@/lib/socket-client";
import Image from "next/image"; // Import the Image component

interface Food {
  _id: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  provider: {  // Change from providerName
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  pickupLocation: string;
  description: string;
  isVeg: boolean;
  imageUrl?: string;
  status: string;
}

export default function CharityDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const socket = getSocket();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/food");
        if (!res.ok) throw new Error("Failed to fetch food data");
        const data: Food[] = await res.json();
        setFoods(data);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };
    fetchFoods();

    // Listen for food status updates
    socket?.on("food-status-updated", (updatedFood: Food) => {
      setFoods(prev => prev.filter(f => f._id !== updatedFood._id));
    });

    return () => {
      socket?.off("food-status-updated");
    };
  }, [socket]);

  const handleRequest = async (foodId: string) => {
    try {
      const res = await fetch(`/api/food/${foodId}/request`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          charityId: localStorage.getItem("userId") // Add charity ID
        })
      });

      if (res.ok) {
        const { chatId } = await res.json();
        // Connect to socket immediately
        const socket = connectSocket(localStorage.getItem("token")!);
        socket.emit("join-chat", chatId);
        router.push(`/chat/${chatId}`);
      } else {
        const data = await res.json();
        console.error("Request failed:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-6 min-h-screen bg-fit bg-center" style={{ backgroundImage: "url('/charity.png')" }}>
      {/* Overlay to make content readable */}
      <div className="absolute inset-0 bg-black bg-opacity-0"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Welcome!</h1>
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
        <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            placeholder="Search by Location..."
            className="w-full p-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Food Cards Grid */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Available Food Entries</h2>
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
                  className="bg-white p-4 rounded-lg shadow-md border relative"
                >
                  {/* Veg/Non-Veg Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded ${food.isVeg
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
                      <Image
                        src={
                          food.imageUrl.startsWith("/") ||
                            food.imageUrl.startsWith("http")
                            ? food.imageUrl
                            : "/default-avatar.png"
                        }
                        alt={food.foodName}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", e.currentTarget.src);
                          e.currentTarget.src = "/default-avatar.png"; // Fallback image
                        }}
                      />
                    ) : (
                      <p className="text-gray-400">No Image Available</p>
                    )}
                  </div>

                  <p className="text-gray-600 font-semibold">Quantity:</p>
                  <p className="text-green-600 text-2xl font-bold"> {food.quantity}</p>

                  <p className="text-gray-600 font-semibold">Category:</p>
                  <p className="text-teal-700">{food.foodCategory}</p>

                  <p className="text-gray-600 font-semibold">Provider:</p>
                  <p className="text-gray-600 bg-white">{food.provider.name}</p>

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
                      <p className="text-gray-600 font-semibold">Food description: </p>
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
    </div>
  );
}