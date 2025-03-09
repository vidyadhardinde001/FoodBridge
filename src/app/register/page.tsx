"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  username: string;
  email: string;
  password: string;
  healthIssues?: string;
  allergies?: string;
  organizationName?: string;
  address?: string;
  licenseNumber?: string;
}

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setFormData({
      username: "",
      email: "",
      password: "",
      healthIssues: "",
      allergies: "",
      organizationName: "",
      address: "",
      licenseNumber: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          role,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert("Registration successful! Redirecting to login...");
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      {!role ? (
        // Role Selection Section
        <div className="flex gap-4">
          <button
            onClick={() => handleRoleSelect("admin")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleSelect("charity")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Charity
          </button>
          <button
            onClick={() => handleRoleSelect("food_provider")}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Food Provider
          </button>
        </div>
      ) : (
        // Registration Form
        <form onSubmit={handleSubmit} className="w-80 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Register as {role.replace("_", " ")}</h3>

          <input
            type="text"
            name="username"
            placeholder="Full Name"
            required
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange}
            value={formData.username}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded mb-2"
            onChange={handleChange}
            value={formData.email}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-2 border rounded mb-4"
            onChange={handleChange}
            value={formData.password}
          />

          {/* Charity & Food Provider Specific Fields */}
          {(role === "charity" || role === "food_provider") && (
            <>
              <input
                type="text"
                name="organizationName"
                placeholder="Organization Name"
                required
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
                value={formData.organizationName}
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                required
                className="w-full p-2 border rounded mb-2"
                onChange={handleChange}
                value={formData.address}
              />
            </>
          )}

          {/* Admin & Food Provider Specific Fields */}
          {(role === "admin" || role === "food_provider") && (
            <input
              type="text"
              name="licenseNumber"
              placeholder="License Number"
              required
              className="w-full p-2 border rounded mb-2"
              onChange={handleChange}
              value={formData.licenseNumber}
            />
          )}

          <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">
            Register
          </button>

          <button
            type="button"
            onClick={() => setRole(null)}
            className="w-full p-2 mt-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Go Back
          </button>
        </form>
      )}
    </div>
  );
}
