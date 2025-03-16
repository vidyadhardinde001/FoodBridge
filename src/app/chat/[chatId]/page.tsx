"use client";

import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaPaperclip, FaRegSmile, FaArrowRight, FaKey } from "react-icons/fa";
import Image from "next/image";

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you?", sender: "provider" },
    { text: "I need help with food donation.", sender: "user" },
  ]);
  const [input, setInput] = useState("");

  // Function to send a message
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");
  };

  // Function to generate a 6-digit OTP
  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    setMessages([...messages, { text: `Your OTP is: ${otp}`, sender: "provider" }]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-[50%] h-screen flex flex-col bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between bg-white/20 p-3 rounded-lg shadow-md border border-white/30">
          <div className="flex items-center space-x-3">
            <Image src="/provider-avatar.png" alt="Provider Avatar" width={40} height={40} className="rounded-full" />
            <div>
              <h2 className="text-lg font-semibold text-white">Provider_Name</h2>
              <p className="text-xs text-gray-300">Last seen 2hrs ago</p>
            </div>
          </div>
          <button className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-all">
            <FaPhone className="text-white text-lg" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 max-w-xs rounded-lg shadow-md text-sm ${
                msg.sender === "user" ? "bg-yellow-400 text-black self-end" : "bg-gray-700 text-white self-start"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex items-center bg-white/20 p-3 rounded-lg border border-white/30">
          <button className="p-2 text-gray-300 hover:text-white">
            <FaRegSmile className="text-xl" />
          </button>
          <button className="p-2 text-gray-300 hover:text-white">
            <FaPaperclip className="text-xl" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 mx-2 bg-white/30 text-white rounded-lg outline-none placeholder-white"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="bg-black p-3 rounded-lg hover:bg-gray-800 transition-all">
            <FaArrowRight className="text-white text-lg" />
          </button>
        </div>

        {/* Generate OTP Button */}
        <button
          onClick={generateOTP}
          className="mt-4 flex items-center justify-center bg-blue-500 text-white font-semibold p-3 rounded-lg w-full hover:bg-blue-600 transition-all"
        >
          <FaKey className="mr-2" /> Generate OTP
        </button>
      </div>
    </div>
  );
}
