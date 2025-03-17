// src/sections/ChatBox.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "@/lib/socket-client";
import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaPaperclip, FaRegSmile, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ChatUI() {
  // const [messages, setMessages] = useState([
  //   { text: "Hello! How can I assist you?", sender: "provider" },
  //   { text: "I need help with food donation.", sender: "user" },
  // ]);
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatStatus, setChatStatus] = useState('pending');
  const socket = getSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChat = async () => {
      const res = await fetch(`/api/chat/${chatId}`);
      const data = await res.json();
      setMessages(data.messages);
    };
    
    loadChat();

    socket?.emit("join-chat", chatId);
    socket?.on("new-message", (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket?.off("new-message");
      socket?.emit("leave-chat", chatId);
    };
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const sendMessage = () => {
    if (!input.trim()) return;
    
    const role = localStorage.getItem("role");
    if (!role) return;
  
    socket?.emit("send-message", {
      chatId,
      text: input,
      sender: role // Should be 'charity' or 'provider'
    });
  
    setInput("");
  };

  const confirmPickup = async () => {
    try {
      const res = await fetch(`/api/chat/${chatId}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (res.ok) {
        setChatStatus("confirmed");
        socket?.emit("food-status-update", { chatId, status: "confirmed" });
      }
    } catch (error) {
      console.error("Confirmation failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      {/* Chat Header */}
      <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-3">
          <Image
            src="/default-avatar.png" // Replace with actual image
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
          className={`... ${msg.sender === 'charity' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <div className="text-xs text-gray-300">
            {msg.sender === 'charity' ? 
              'Charity User' : 
              'Provider User'}
          </div>
          {msg.text}
        </motion.div>
      ))}
        <div ref={messagesEndRef} />
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

      {chatStatus === 'pending' && (
        <button 
          onClick={confirmRequest}
          className="bg-green-500 p-2 rounded-lg text-white"
        >
          Confirm Request
        </button>
      )}

{localStorage.getItem("role") === "provider" && foodStatus === "pending" && (
        <button 
          onClick={confirmPickup}
          className="mt-4 p-2 bg-green-500 text-white rounded-lg flex items-center gap-2 justify-center"
        >
          <FaCheckCircle />
          Confirm Pickup
        </button>
      )}
    </div>
  );
}
