// dashboard/charity/page.tsx

"use client";
import { useState, useEffect } from 'react';

export default function CharityDashboard() {
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      const res = await fetch('/api/food');
      const data = await res.json();
      setFoods(data);
    };
    fetchFoods();
  }, []);

  const handleRequest = async (foodId: any) => {
    try {
      const res = await fetch(`/api/food/${foodId}/request`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (res.ok) {
        const updatedFood = await res.json();
        setFoods(foods.map(f => f._id === foodId ? updatedFood : f));
      } else {
        const data = await res.json();
        console.error('Request failed:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Charity Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search By location"
        className="w-full p-2 border rounded-lg mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Food Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {foods
          .filter(food => food.status === 'available')
          .map(food => (
            <div key={food._id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{food.foodName}</h3>
              <p>Quantity: {food.quantity}</p>
              <p>Location: {food.pickupLocation}</p>
              <p>Description: {food.description}</p>
              <button
                onClick={() => handleRequest(food._id)}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                Request Pickup
              </button>
            </div>
          ))}
      </div>
    </>
  );
}