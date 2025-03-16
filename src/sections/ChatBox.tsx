"use client";

import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaPaperclip, FaRegSmile, FaArrowRight } from "react-icons/fa";
import Image from "next/image";

export default function ChatUI() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you?", sender: "provider" },
    { text: "I need help with food donation.", sender: "user" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      {/* Chat Header */}
      <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <Image
            src="/provider-avatar.png" // Replace with actual image
            alt="Provider Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">Provider_Name</h2>
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
      <div className="flex items-center bg-gray-700 p-3 rounded-lg">
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
          className="flex-1 p-2 mx-2 bg-gray-800 text-white rounded-lg outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-black p-3 rounded-lg hover:bg-gray-800 transition-all"
        >
          <FaArrowRight className="text-white text-lg" />
        </button>
      </div>
    </div>
  );
}
