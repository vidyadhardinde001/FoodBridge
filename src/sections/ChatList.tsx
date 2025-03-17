// src/sections/ChatList.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import React from "react";
import Image from "next/image";
import { getSocket } from "@/lib/socket-client";


const defaultAvatar = "/default-avatar.png";

interface Contact {
  id: string;
  name: string;
  profileImage: string;
  lastMessage?: string;
}

export default function ChatList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const socket = getSocket();

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      
      try {
        const res = await fetch("/api/chat", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log(data);
        
        const mappedContacts = data.map((chat) => ({
          id: chat._id,
          name: role === 'provider' ? chat.charityId.name : chat.providerId.name,
          profileImage: role === 'provider' 
            ? chat.charityId.profileImage || '/default-avatar.png'
            : chat.providerId.profileImage || '/default-avatar.png',
          lastMessage: chat.messages[chat.messages.length - 1]?.text
        }));
        
        setContacts(mappedContacts);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };
  
    fetchChats();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Messages</h1>
      <div className="bg-white shadow-lg rounded-lg p-4">
        {contacts.length === 0 ? (
          <p className="text-gray-600">No messages yet.</p>
        ) : (
          <ul>
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center p-3 border-b last:border-none hover:bg-gray-100 rounded-lg transition cursor-pointer"
                onClick={() => router.push(`/chat/${contact.id}`)}
              >
                <Image
                  src="/default-avatar.png"
                  alt={contact.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mr-4"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-medium">{contact.name}</h3>
                  {contact.lastMessage && (
                    <p className="...">{contact.lastMessage}</p>
                  )}
                </div>
                <MessageCircle className="text-blue-500 w-6 h-6" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Back Button */}
      <Link href="/dashboard">
        <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
}
