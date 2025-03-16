"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    }
  }, []);

  return (
    <div className="w-full mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">No items in cart</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartItems.map((food) => (
            <div key={food._id} className="bg-white p-4 rounded-lg shadow-md border">
              {/* Food Name */}
              <h3 className="text-xl font-semibold text-gray-800">{food.foodName}</h3>

              {/* Image */}
              <div className="w-full h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center mt-2">
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt={food.foodName} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-400">No Image Available</p>
                )}
              </div>

              {/* Food Details */}
              <p className="text-teal-700 mt-2 font-semibold">Quantity: {food.quantity}</p>
              <p className="text-gray-600"><strong>Category:</strong> {food.foodCategory}</p>
              <p className="text-gray-600"><strong>Description:</strong> {food.description || "No description available"}</p>
              <p className="text-gray-600"><strong>Pickup Location:</strong> {food.pickupLocation}</p>
              
              {/* Provider Details */}
              <p className="text-gray-600"><strong>Provider:</strong> {food.providerName}</p>
              <p className="text-gray-600"><strong>Contact:</strong> {food.contact || "Not provided"}</p>

              {/* Remove Item Button */}
              <button
                onClick={() => {
                  const updatedCart = cartItems.filter((item) => item._id !== food._id);
                  setCartItems(updatedCart);
                  localStorage.setItem("cartItems", JSON.stringify(updatedCart));
                }}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700 transition"
              >
                Remove Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
