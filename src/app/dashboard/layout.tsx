// app/dashboard/layout.tsx
"use client"; // Mark this as a client component
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if no token is found
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold text-green-600">FoodBridge</h2>
        <nav className="mt-6">
          <a className="block p-3 bg-yellow-400 text-white rounded-lg mb-2">Home</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">About Us</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Features</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Analytics</a>
          <a className="block p-3 text-gray-700 hover:bg-gray-200 rounded-lg">Contact</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}