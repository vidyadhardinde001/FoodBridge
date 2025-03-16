"use client";
import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProviderRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address
    ) {
      setError("All fields are required");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "provider" })
      });

      if (res.ok) {
        router.push("/login/provider");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Registration Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/20 backdrop-blur-lg shadow-lg rounded-2xl p-10 text-center w-[90%] max-w-md border border-white/30"
      >
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl font-bold text-white drop-shadow-lg"
        >
          Provider Registration
        </motion.h2>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-4 mt-6"
        >
          <input type="text" placeholder="Your Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border rounded-lg bg-white/30 text-white placeholder-white" required />
          <input type="email" placeholder="Email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 border rounded-lg bg-white/30 text-white placeholder-white" required />
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 border rounded-lg bg-white/30 text-white placeholder-white" required />
          <input type="text" placeholder="Phone" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 border rounded-lg bg-white/30 text-white placeholder-white" required />
          <input type="text" placeholder="Address" name="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 border rounded-lg bg-white/30 text-white placeholder-white" required />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-3 rounded-lg shadow-md hover:shadow-xl transition font-semibold">Register</motion.button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </motion.form>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="mt-6 text-white/80">
          Already have an account? {" "}
          <Link href="/login/provider" className="text-white font-semibold underline">
            Login here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
