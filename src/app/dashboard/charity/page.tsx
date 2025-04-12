// /dashboard/charity/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { connectSocket } from "@/lib/socket-client";
import LoadingButton from "@/app/components/LoadingButton";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import Link from "next/link";
import ProviderProfileModal from 'src/app/components/ProviderProfileModal';
import { 
  BellIcon, 
  ShoppingBagIcon, 
  UserCircleIcon, 
  UsersIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface Food {
  _id: string;
  foodName: string;
  foodCategory: string;
  quantity: number;
  quantityUnit: string;
  provider: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  pickupLocation: string;
  pricingType: 'free' | 'paid';
  price?: number;
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewedNotificationIds, setViewedNotificationIds] = useState<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'quantity' | null>(null);
  const [distanceValues, setDistanceValues] = useState<{ [key: string]: number }>({});
  const [loadingDistances, setLoadingDistances] = useState(false);
  const [pricingFilter, setPricingFilter] = useState<'free' | 'paid' | null>(null);
  const [cart, setCart] = useState<Food[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const socket = getSocket();


  const toggleCartItem = (food: Food) => {
    setCart(prevCart => {
      const isAlreadyInCart = prevCart.some(item => item._id === food._id);
      if (isAlreadyInCart) {
        return prevCart.filter(item => item._id !== food._id);
      } else {
        return [...prevCart, food];
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Request all items in cart
  const handleBulkRequest = async () => {
    setIsRequesting(true);
    try {
      const results = await Promise.all(
        cart.map(async (food) => {
          try {
            const res = await fetch("/api/request", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({
                foodId: food._id,
                charityId: localStorage.getItem("userId")
              })
            });

            if (res.ok) {
              return { success: true, foodId: food._id };
            } else {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Request failed');
            }
          } catch (error) {
            console.error(`Request failed for food ${food._id}:`, error);
            return { success: false, foodId: food._id };
          }
        })
      );

      const successfulRequests = results.filter(r => r.success);
      if (successfulRequests.length > 0) {
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        successDiv.textContent = `Successfully requested ${successfulRequests.length} item(s)!`;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);

        // Remove successfully requested items from cart
        setCart(prev => prev.filter(item => !successfulRequests.some(r => r.foodId === item._id)));
      }

      if (results.some(r => !r.success)) {
        // Show partial success notification if some failed
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        warningDiv.textContent = `Some requests didn't go through. Please try again.`;
        document.body.appendChild(warningDiv);
        setTimeout(() => warningDiv.remove(), 3000);
      }
    } catch (error) {
      console.error("Bulk request failed:", error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorDiv.textContent = 'Failed to send requests. Please try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    const savedViewed = localStorage.getItem('viewedNotifications');
    if (savedViewed) {
      setViewedNotificationIds(new Set(JSON.parse(savedViewed)));
    }
  }, []);
  // Update your loadDistances function:
  const loadDistances = async (foodsToCalculate: Food[]) => {
    setLoadingDistances(true);
    const newDistances: { [key: string]: string } = {};
    const newDistanceValues: { [key: string]: number } = {};

    try {
      await Promise.all(foodsToCalculate.map(async (food) => {
        try {
          const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
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
                    latitude: food.coordinates.lat,
                    longitude: food.coordinates.lng,
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
          });

          if (!response.ok) throw new Error("Failed to calculate distance");

          const data = await response.json();
          if (data.routes?.[0]?.distanceMeters) {
            const distanceKm = data.routes[0].distanceMeters / 1000;
            newDistances[food._id] = `${distanceKm.toFixed(1)} km`;
            newDistanceValues[food._id] = distanceKm;
          }
        } catch (error) {
          console.error(`Error calculating distance for food ${food._id}:`, error);
          newDistances[food._id] = "Error";
          newDistanceValues[food._id] = Infinity;
        }
      }));

      // Only update state if we actually got new distances
      if (Object.keys(newDistances).length > 0) {
        setDistances(prev => {
          // Only update if the distance is actually new or different
          const updated = { ...prev };
          let hasChanges = false;

          for (const [id, distance] of Object.entries(newDistances)) {
            if (prev[id] !== distance) {
              updated[id] = distance;
              hasChanges = true;
            }
          }

          return hasChanges ? updated : prev;
        });

        setDistanceValues(prev => ({ ...prev, ...newDistanceValues }));
      }
    } catch (error) {
      console.error("Error in distance calculation batch:", error);
    } finally {
      setLoadingDistances(false);
    }
  };

  const handleMapRedirect = (providerCoords: { lat: number; lng: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${providerCoords.lat},${providerCoords.lng}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (charityLocation.lat !== 0 && foods.length > 0) {
      const availableFoods = foods.filter(food =>
        food.status === "available" &&
        food.provider &&
        !distances[food._id] // Only calculate if we don't already have this distance
      );

      if (availableFoods.length > 0) {
        loadDistances(availableFoods);
      }
    }
  }, [charityLocation, foods]); // Remove distances from dependencies

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
    // Filter foods
    const filtered = foods.filter((food) => {
      if (food.status !== "available" || !food.provider) return false;

      const matchesSearch = searchQuery === "" ||
        food.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVeg = vegFilter === null || food.isVeg === vegFilter;
      const matchesCondition = conditionFilter === null ||
        food.condition?.toLowerCase() === conditionFilter.toLowerCase();
      const matchesCategory = foodCategoryFilter === null ||
        food.foodCategory.toLowerCase() === foodCategoryFilter.toLowerCase();
      const matchesPricing = pricingFilter === null ||
        food.pricingType === pricingFilter;

      return matchesSearch && matchesVeg && matchesCondition && matchesCategory && matchesPricing;
    });

    // Sort foods
    const sorted = [...filtered];
    if (sortBy === 'distance') {
      sorted.sort((a, b) => {
        const distA = distanceValues[a._id] || Infinity;
        const distB = distanceValues[b._id] || Infinity;
        return distA - distB; // Nearest first
      });
    } else if (sortBy === 'quantity') {
      sorted.sort((a, b) => b.quantity - a.quantity); // Highest quantity first
    } else if (sortBy === 'pricing') {
      sorted.sort((a, b) => {
        if (a.pricingType === b.pricingType) return 0;
        return a.pricingType === 'free' ? -1 : 1;
      });
    }

    setFilteredFoods(sorted);
  }, [foods, searchQuery, vegFilter, conditionFilter, foodCategoryFilter, distanceValues, sortBy, pricingFilter]);

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

  const handleRequestConfirmation = async (foodId: string) => {
    // Create a modal dialog element
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

    // Modal content with loading state support
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Confirm Request</h3>
        <p class="text-gray-600 mb-6">Are you sure you want to request this food item?</p>
        
        <div class="flex justify-end space-x-3">
          <button id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button id="confirm-btn" class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition flex items-center justify-center min-w-24">
            Confirm
          </button>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(modal);

    // Get references to buttons
    const confirmBtn = modal.querySelector('#confirm-btn') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement;

    // Wrap in Promise to await user action
    const userConfirmed = await new Promise<boolean>((resolve) => {
      confirmBtn.onclick = () => resolve(true);
      cancelBtn.onclick = () => {
        modal.remove();
        resolve(false);
      };
    });

    if (!userConfirmed) return;

    // User confirmed - show loading state
    confirmBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `;
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;

    try {
      const res = await fetch("/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          foodId,
          charityId: localStorage.getItem("userId")
        })
      });

      if (res.ok) {
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        successDiv.textContent = 'Request sent successfully!';
        document.body.appendChild(successDiv);

        // Remove after delay
        setTimeout(() => {
          successDiv.remove();
          modal.remove();
        }, 3000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Request failed');
      }
    } catch (error) {
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
      errorDiv.textContent = error instanceof Error ? error.message : 'Request failed';
      document.body.appendChild(errorDiv);

      // Remove after delay
      setTimeout(() => {
        errorDiv.remove();
        modal.remove();
      }, 3000);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);



  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div
      className="w-full mx-auto p-6 min-h-screen bg-fit bg-center"
      style={{ backgroundImage: "url('/charity.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0"></div>

      <div className="relative z-10">
      <header className="flex justify-between items-center mb-6 px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
  {/* Left side - Welcome title */}
  <h1 className="text-2xl font-semibold text-white">
    Welcome<span className="text-blue-300">!</span>
  </h1>

  {/* Right side - Action buttons */}
  <div className="flex items-center gap-3">
    {/* Notifications */}
    <div className="relative">
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          const newViewedIds = new Set(viewedNotificationIds);
          notifications.forEach(n => newViewedIds.add(n._id));
          setViewedNotificationIds(newViewedIds);
          localStorage.setItem('viewedNotifications', JSON.stringify(Array.from(newViewedIds)));
        }}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
      >
        <BellIcon className="w-5 h-5 text-white" />
        {notifications.filter(n => !viewedNotificationIds.has(n._id)).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-gray-900">
            {notifications.filter(n => !viewedNotificationIds.has(n._id)).length}
          </span>
        )}
      </button>
    </div>

    {/* Cart */}
    <div className="relative">
      <button
        onClick={() => setIsCartOpen(true)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <ShoppingBagIcon className="w-5 h-5 text-white" />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-teal-400 text-gray-900 rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-gray-900 font-bold">
            {cart.length}
          </span>
        )}
      </button>
    </div>

  </div>
</header>

        {showNotifications && (
          <div className="absolute right-4 top-16 z-50 bg-white rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 mb-2 rounded-lg ${viewedNotificationIds.has(notification._id) ? 'bg-gray-50' : 'bg-blue-50'}`}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsCartOpen(false)}></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Selected Food Items ({cart.length})
                  </h3>
                  {cart.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                        {cart.map((food) => (
                          <div key={food._id} className="border-b pb-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={food.imageUrl ? `/api/proxy-image?url=${encodeURIComponent(food.imageUrl)}` : "/default-avatar.png"}
                                  alt={food.foodName}
                                  className="w-12 h-12 rounded-md object-cover"
                                />
                                <div>
                                  <h4 className="font-medium">{food.foodName}</h4>
                                  <p className="text-sm text-gray-500">{food.provider?.name}</p>
                                  <p className="text-xs text-gray-400">{food.quantity} kg</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleCartItem(food)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 flex justify-end space-x-2">
                              <button
                                onClick={() => handleIndividualChat(food)}
                                disabled={isRequesting}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                Chat
                              </button>
                              <button
                                onClick={() => handleRequestConfirmation(food._id)}
                                disabled={isRequesting}
                                className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                Request
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bulk Request Button */}
                      <div className="border-t pt-4">
                        <button
                          onClick={handleBulkRequest}
                          disabled={isRequesting}
                          className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {isRequesting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Requesting All Items...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                              Request All {cart.length} Items
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Clear Cart
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Sort By
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={sortBy || ''}
                onChange={(e) => setSortBy(e.target.value === '' ? null : (e.target.value as 'distance' | 'quantity' | 'pricing'))}
              >
                <option value="">Default</option>
                <option value="distance">Distance (Nearest)</option>
                <option value="quantity">Quantity</option>
                <option value="pricing">Pricing Type</option>
              </select>

            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Pricing Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={pricingFilter || ''}
                onChange={(e) => setPricingFilter(e.target.value || null)}
              >
                <option value="">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-xl"
                >
                  {/* Frosted glass background */}
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl"></div>

                  {/* Card content */}
                  <div className="relative p-6 h-full flex flex-col">
                    {/* Header with veg/non-veg and checkbox */}
                    <div className="flex justify-between items-start mb-4">

                      <div className="flex gap-2 justify-between items-start">
                        <span

                          className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${food.isVeg
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                            }`}
                        >
                          {food.isVeg ? "VEG" : "NON-VEG"}
                        </span>
                        {/* Replace your current distance display with this */}
                        <div className="flex bottom-2 left-2 bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          {loadingDistances ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Calculating...
                            </span>
                          ) : (
                            distances[food._id] || "Not available"
                          )}
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={cart.some(item => item._id === food._id)}
                        onChange={() => toggleCartItem(food)}
                        className="w-5 h-5 accent-teal-600 cursor-pointer transform transition hover:scale-110"
                      />
                    </div>

                    {/* Food image with hover zoom effect */}
                    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 group-hover:shadow-lg transition-all duration-300">
                      {food.imageUrl ? (
                        <img
                          src={`/api/proxy-image?url=${encodeURIComponent(food.imageUrl)}`}
                          alt={food.foodName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            console.error("Image failed to load:", e.currentTarget.src);
                            e.currentTarget.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                          <p className="text-gray-400">No Image Available</p>
                        </div>
                      )}
                    </div>

                    {/* Food name and category */}
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{food.foodName}</h3>
                    <p className="text-teal-700 font-medium text-sm mb-3">{food.foodCategory}</p>

                    {/* Quantity and provider */}
                    <div className="flex justify-between items-center mb-4">


                      <div>
                        <p className="text-gray-600 text-xs font-semibold">QUANTITY {food.quantityUnit}</p>
                        <p className="text-green-600 text-xl font-bold animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                          {food.quantity} {food.quantityUnit}
                        </p>

                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-xs font-semibold">PROVIDER</p>
                        <p className="text-gray-700 bg-white cursor-pointer hover:underline"
                          onClick={() => food.provider?._id && setSelectedProviderId(food.provider._id)}>
                          {food.provider?.name || "No provider available"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-xs font-semibold mb-1">PICKUP LOCATION</p>
                      <p className="text-gray-700">{food.pickupLocation}</p>
                    </div>

                    {/* Add near the quantity display */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${food.pricingType === 'free'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {food.pricingType === 'free' ? 'FREE' : 'PAID'}
                      </span>
                      {food.pricingType === 'paid' && (
                        <span className="text-blue-600 font-semibold">
                          ₹{food.price}
                        </span>
                      )}
                    </div>


                    {/* View more button with animated arrow */}
                    <button
                      onClick={() => setExpandedFood(expandedFood === food._id ? null : food._id)}
                      className="mt-4 flex items-center justify-between w-full px-4 py-3 bg-white/70 hover:bg-white/90 text-gray-800 font-medium rounded-lg border border-gray-200 transition-all duration-300 group-hover:shadow-sm"
                    >
                      <span>{expandedFood === food._id ? "Show Less" : "Show Details"}</span>
                      <svg
                        className={`w-5 h-5 ml-2 transition-transform duration-300 ${expandedFood === food._id ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {expandedFood === food._id && (
                      <div className="mt-2 border-t border-gray-200/70 space-y-4">

                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-gray-600 text-xs font-semibold mb-1">DESCRIPTION</p>
                            <p className="text-gray-700">{food.description || "No description provided."}</p>
                          </div>

                          {/* Ratings */}
                          <div className="mt-auto">
                            <div className="flex items-center">
                              <div className="relative">
                                <div className="text-gray-300 text-xl">★★★★★</div>
                                <div
                                  className="text-yellow-400 text-xl absolute top-0 overflow-hidden"
                                  style={{ width: `${4.5 / 5 * 100}%` }}
                                >
                                  ★★★★★
                                </div>
                              </div>
                              <span className="ml-2 text-gray-600 text-sm">4.5</span>
                            </div>
                            <button
                              onClick={() => handleViewReviews(food._id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              View All Reviews →
                            </button>
                          </div>
                        </div>


                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleMapRedirect(food.coordinates)}
                            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-lg transition-all duration-300 hover:shadow-sm"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <span>Map</span>
                          </button>

                          <LoadingButton
                            onClick={() => handleRequest(food._id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-sm"
                            loadingText="Contacting..."
                          >
                            Contact Provider
                          </LoadingButton>

                          <LoadingButton
                            onClick={() => handleRequestConfirmation(food._id)}
                            className="col-span-2 bg-white border-2 border-teal-600 text-teal-600 font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:bg-teal-600 hover:text-white hover:shadow-md"
                          >
                            Request Food Donation
                          </LoadingButton>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ProviderProfileModal
        providerId={selectedProviderId}
        onClose={() => setSelectedProviderId(null)}
      />
    </div>
  );
}