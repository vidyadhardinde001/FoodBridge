// chat/[chatId]/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaPhone, FaPaperclip, FaRegSmile, FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import { connectSocket, getSocket } from "@/lib/socket-client";

export default function ChatUI() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<{ name: string; image: string }>({
    name: "Loading...",
    image: "/default-avatar.png",
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (!userRole) return;
    const loadChatDetails = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        const chat = await res.json();

        // Set other user's details
        const isProvider = userRole === "provider";
        const contact = isProvider ? chat.charityId : chat.providerId;
        setOtherUser({
          name: contact.name,
          image: contact.profileImage || "/default-avatar.png",
        });

        // Set messages
        setMessages(chat.messages);
      } catch (error) {
        console.error("Failed to load chat details:", error);
      }
    };

    loadChatDetails();
  }, [chatId, userRole]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = connectSocket(token!);

    // Join chat room
    socket?.emit("join-chat", chatId);

    // Handle new messages
    type MessageType = {
      _id: string;
      sender: string;
      text: string;
      timestamp: string;
      userId?: string; // Optional in case it's not always present
      temporary?: boolean;
      tempId?: string; // Unique identifier for temporary messages
    };

    const handleNewMessage = (message: MessageType) => {
      setMessages((prev) => {
        // Check if this message matches a temporary message
        const existingTempIndex = prev.findIndex(
          (msg) => msg.tempId && msg.text === message.text
        );

        if (existingTempIndex !== -1) {
          // Replace the temporary message with the actual message
          const updatedMessages = [...prev];
          updatedMessages[existingTempIndex] = message;
          return updatedMessages;
        } else {
          // Add the new message if no matching temporary message is found
          return [...prev, message];
        }
      });

      scrollToBottom();
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket?.emit("leave-chat", chatId);
    };
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userId = localStorage.getItem("userId");

    // Create a temporary message
    const tempMessage = {
      _id: Date.now().toString(), // Unique ID for temporary message
      text: input,
      sender: userRole,
      timestamp: new Date(),
      temporary: true,
      tempId: Date.now().toString(), // Unique identifier for temporary message
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Clear input
    setInput("");

    // Send message to server
    socket?.emit("send-message", {
      chatId,
      text: input,
      sender: userRole,
      userId,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-[50%] h-screen flex flex-col bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg border border-white/20">
        {/* Chat Header */}
        <div className="flex items-center justify-between bg-white/20 p-3 rounded-lg shadow-md border border-white/30">
          <div className="flex items-center space-x-3">
            <Image
              src={otherUser.image}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
            <div>
              <h2 className="text-lg font-semibold text-white">{otherUser.name}</h2>
              <p className="text-xs text-gray-300">Online</p>
            </div>
          </div>
          <button className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition-all">
            <FaPhone className="text-white text-lg" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg._id}
              className={`flex ${msg.sender === userRole ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`p-3 rounded-lg max-w-xs ${
                  msg.sender === userRole
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-xs opacity-75 mb-1">
                  {msg.sender === userRole ? "You" : otherUser.name}
                </div>
                {msg.text}
                <div className="text-xs mt-1 opacity-75">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="flex items-center bg-white/20 p-3 rounded-lg border border-white/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-2 mx-2 bg-white/30 text-white rounded-lg outline-none placeholder-white"
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
    </div>
  );
}