// terms/page.tsx

"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaShieldAlt, FaCamera, FaClipboardList, FaCheckCircle } from "react-icons/fa";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Community Guidelines</h1>
          <p className="text-xl text-gray-600">Ensuring safe and effective food sharing for everyone</p>
        </div>

        {/* Food Safety Guidelines */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-red-500 p-4 flex items-center">
            <FaShieldAlt className="text-white text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-white">Food Safety Guidelines</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Ensure the food is fresh and safe for consumption.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Do not upload spoiled or expired food items.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Share only properly cooked or packaged food.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Pack the food in clean, hygienic containers.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Label the food with the date and time of preparation (if possible).</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Avoid sharing partially eaten or opened food packages.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>If the food contains allergens (nuts, dairy, gluten, etc.), mention them clearly.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Do not include alcohol or prohibited substances.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Maintain the right temperature for perishable items until pickup.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Respect food handling standards as per FSSAI or local safety norms.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Image Upload Guidelines */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-blue-500 p-4 flex items-center">
            <FaCamera className="text-white text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-white">Image Upload Guidelines</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Upload clear and well-lit images of the food.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Use a plain background to avoid distractions.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Show the actual quantity/packaging in the image.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Do not upload blurry, dark, or misleading photos.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Include multiple angles if needed (top view, side view).</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Avoid stock or downloaded images—real photos only.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Ensure no personal or inappropriate content appears in the background.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>If possible, include the packaging date or expiry label in the photo.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Data Entry Guidelines */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-purple-500 p-4 flex items-center">
            <FaClipboardList className="text-white text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-white">Data Entry Guidelines</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Mention the name/type of the food item.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Provide a short, clear description (e.g., "Veg Biryani – Serves 4").</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Specify whether it's veg or non-veg.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Enter the expiry or use-by date accurately.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Mention the number of servings or approximate quantity.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Add the pickup time and location clearly.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Highlight if refrigeration is required.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Include any special instructions or warnings (e.g., spicy, not suitable for kids).</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Make sure all details are double-checked before uploading.</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span>Agree to the platform's safety declaration before submitting.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <Link 
            href="/register/provider" 
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            I Understand - Continue Registration
          </Link>
          <p className="mt-4 text-gray-600">
            By continuing, you agree to comply with all community guidelines
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}