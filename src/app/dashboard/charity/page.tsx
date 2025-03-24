// /dashboard/charity/page.tsx

"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { connectSocket } from "@/lib/socket-client";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

interface Food {
  _id: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  provider: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  pickupLocation: string;
  description: string;
  isVeg: boolean;
  condition: 'used' | 'unused';
  imageUrl?: string;
  status: string;
  reviews: {
    rating: number;
    comment: string;
    user: string;
  }[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function CharityDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<boolean | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const [charityLocation, setCharityLocation] = useState({ lat: 0, lng: 0 });
  const [distances, setDistances] = useState<{ [key: string]: string }>({});
  const socket = getSocket();

  const loadDistance = async (
    foodId: string,
    origin: { lat: number; lng: number }
  ) => {
    try {
      const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            "X-Goog-FieldMask": "routes.distanceMeters",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: charityLocation.lat,
                  longitude: charityLocation.lng,
                },
              },
            },
            travelMode: "DRIVE",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Routes API Error:", errorData);
        return;
      }

      const data = await response.json();
      if (data.routes?.[0]?.distanceMeters) {
        setDistances((prev) => ({
          ...prev,
          [foodId]: `${(data.routes[0].distanceMeters / 1000).toFixed(1)} km`,
        }));
      }
    } catch (error) {
      console.error("Error fetching distance:", error);
    }
  };

  const handleMapRedirect = (providerCoords: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${providerCoords.lat},${providerCoords.lng}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (expandedFood && charityLocation.lat !== 0) {
      const food = foods.find((f) => f._id === expandedFood);
      if (food && !distances[expandedFood]) {
        loadDistance(expandedFood, food.coordinates);
      }
    }
  }, [expandedFood, charityLocation]);

  useEffect(() => {
    const fetchCharityLocation = async () => {
      try {
        const res = await fetch(`/api/users/${localStorage.getItem("userId")}`);
        if (!res.ok) throw new Error("Failed to fetch charity location");
        const data = await res.json();
        setCharityLocation(data.coordinates);
      } catch (error) {
        console.error("Error fetching charity location:", error);
      }
    };

    fetchCharityLocation();
  }, []);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["geometry"],
  });

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await fetch("/api/food");
        if (!res.ok) throw new Error("Failed to fetch food data");
        const data: Food[] = await res.json();
        setFoods(data);
        setFilteredFoods(data);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };
    fetchFoods();

    socket?.on("food-status-updated", (updatedFood: Food) => {
      setFoods((prev) => prev.filter((f) => f._id !== updatedFood._id));
      setFilteredFoods((prev) => prev.filter((f) => f._id !== updatedFood._id));
    });

    return () => {
      socket?.off("food-status-updated");
    };
  }, [socket]);

  useEffect(() => {
    const filtered = foods.filter((food) => {
      if (food.status !== "available" || !food.provider) return false;
      
      // Combined search for both food name and location
      const searchMatch = searchQuery === "" || 
        food.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const vegMatch = vegFilter === null || food.isVeg === vegFilter;
      const conditionMatch = conditionFilter === null || 
                      food.condition?.toLowerCase() === conditionFilter.toLowerCase();
      const categoryMatch = foodCategoryFilter === null || 
                         food.foodCategory.toLowerCase() === foodCategoryFilter.toLowerCase();
      
      return searchMatch && vegMatch && categoryMatch && conditionMatch;
    });
    
    setFilteredFoods(filtered);
  }, [foods, searchQuery, vegFilter, foodCategoryFilter,conditionFilter]);

  const handleRequest = async (foodId: string) => {
    try {
      const res = await fetch(`/api/food/${foodId}/request`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          charityId: localStorage.getItem("userId"),
        }),
      });

      if (res.ok) {
        const { chatId } = await res.json();
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

  const calculateAverageRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const handleViewReviews = (foodId: string) => {
    router.push(`/review?foodId=${foodId}`);
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div
      className="w-full mx-auto p-6 min-h-screen bg-fit bg-center"
      style={{ backgroundImage: "url('/charity.png')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0"></div>

      <div className="relative z-10">
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

        <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Search Food or Location
            </label>
            <input
              type="text"
              placeholder="Search by food name or location..."
              className="w-full p-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Food Condition
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={conditionFilter || "all"}
                onChange={(e) => setConditionFilter(e.target.value === "all" ? null : e.target.value)}
              >
                <option value="all">All Conditions</option>
                <option value="used">Used</option>
                <option value="unused">Unused</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Food Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={vegFilter === null ? "all" : vegFilter ? "veg" : "nonveg"}
                onChange={(e) => {
                  const value = e.target.value;
                  setVegFilter(
                    value === "all" ? null : value === "veg" ? true : false
                  );
                }}
              >
                <option value="all">All Types</option>
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Food Category
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={foodCategoryFilter || ""}
                onChange={(e) => {
                  setFoodCategoryFilter(
                    e.target.value === "all" ? null : e.target.value
                  );
                }}
              >
                <option value="all">All Categories</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="grains">Grains</option>
                <option value="cooked meals">Cooked Meals</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Available Food Entries</h2>
          <div className="border-t my-2"></div>

          {filteredFoods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">
                No food items match your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setVegFilter(null);
                  setFoodCategoryFilter(null);
                }}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="bg-white p-4 rounded-lg shadow-md border relative"
                >
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded ${
                        food.isVeg
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {food.isVeg ? "Veg" : "Non-Veg"}
                    </span>

                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-teal-600"
                    />
                  </div>

                  <h3 className="text-lg font-semibold">{food.foodName}</h3>

                  <div className="w-full h-[300px] bg-white rounded-lg overflow-hidden flex items-center justify-center">
                    {food.imageUrl ? (
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(
                          food.imageUrl
                        )}`}
                        alt={food.foodName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            e.currentTarget.src
                          );
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <p className="text-gray-400">No Image Available</p>
                    )}
                  </div>

                  <p className="text-gray-600 font-semibold">Quantity:</p>
                  <p className="text-green-600 text-2xl font-bold">
                    {food.quantity}
                  </p>

                  <p className="text-gray-600 font-semibold">Category:</p>
                  <p className="text-teal-700">{food.foodCategory}</p>

                  <p className="text-gray-600 font-semibold">Provider:</p>
                  <p className="text-gray-600 bg-white">
                    {food.provider?.name || "No provider available"}
                  </p>

                  <div className="mt-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-2xl">★★★★☆</span>
                      <span className="ml-2 text-gray-600">(4.5)</span>
                    </div>
                    <button
                      onClick={() => handleViewReviews(food._id)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      View All Reviews
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedFood(
                        expandedFood === food._id ? null : food._id
                      )
                    }
                    className="mt-3 flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 ease-in-out"
                  >
                    {expandedFood === food._id ? "View Less" : "View More"}
                  </button>

                  {expandedFood === food._id && (
                    <div className="mt-2 border-t pt-2">
                      <p className="text-gray-600 font-semibold">
                        Food description:{" "}
                      </p>
                      <p className="text-teal-700 bg-white">
                        {food.description}
                      </p>

                      <p className="text-gray-600 font-semibold mt-2">
                        Location:
                      </p>
                      <p className="text-teal-700 mt-2">
                        {food.pickupLocation}
                      </p>

                      <div className="w-full h-64 relative">
                        <LoadScript
                          googleMapsApiKey={
                            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                          }
                          libraries={["geometry"]}
                        >
                          <GoogleMap
                            mapContainerStyle={{
                              width: "100%",
                              height: "100%",
                            }}
                            center={food.coordinates}
                            zoom={14}
                          >
                            <Marker position={food.coordinates} />
                            <Marker
                              position={charityLocation}
                              label="You"
                              icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 8,
                                fillColor: "#4285F4",
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "#FFFFFF",
                              }}
                            />
                          </GoogleMap>
                        </LoadScript>
                        <div className="absolute top-2 left-2 bg-white p-2 rounded">
                          Distance: {distances[food._id] || "Calculating..."}
                        </div>
                      </div>

                      <button
                        onClick={() => handleMapRedirect(food.coordinates)}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
                      >
                        Open in Google Maps
                      </button>

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
          )}
        </div>
      </div>
    </div>
  );
}