"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/20 backdrop-blur-lg shadow-lg rounded-2xl p-10 text-center w-[90%] max-w-md border border-white/30"
      >
        {/* Title & Tagline */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-extrabold text-white drop-shadow-lg"
        >
          Welcome to FoodBridge
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-2 text-lg text-white/80"
        >
          Connecting Food With Those In Need.
        </motion.p>

        {/* Buttons */}
        <motion.div className="mt-6 space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login/provider")}
            className="w-full border-4 border-blue-500 text-white p-3 rounded-lg shadow-md hover:shadow-xl transition font-semibold"
          >
            Login as Provider
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login/charity")}
            className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md hover:shadow-xl transition font-semibold"
          >
            Login as Charity
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-white/80"
        >
          Don&apos;t have an account?{" "}
          <Link href="/register/charity" className="text-white font-semibold underline">
            Register here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
