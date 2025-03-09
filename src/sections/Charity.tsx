import { useState } from "react";

export default function Dashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-green-600 mb-6">FoodBridge</h2>
        <nav className="space-y-2">
          <button className="w-full text-left p-3 bg-yellow-400 text-white rounded-lg">Home</button>
          <button className="w-full text-left p-3 bg-gray-200 rounded-lg">About Us</button>
          <button className="w-full text-left p-3 bg-gray-200 rounded-lg">Features</button>
          <button className="w-full text-left p-3 bg-gray-200 rounded-lg">Analytics</button>
          <button className="w-full text-left p-3 bg-gray-200 rounded-lg">Contact</button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Search By Location</h1>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg">Sign in</button>
        </div>
        
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
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-300 p-4 rounded-lg shadow">
              <p className="font-semibold">*Sample location</p>
              <p>*Provider name</p>
              <p>*Quantity</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}