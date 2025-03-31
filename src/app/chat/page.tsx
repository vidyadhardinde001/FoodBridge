"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoadingButton from "../components/LoadingButton";

interface ChatContact {
  _id: string;
  charityId: { name: string; profileImage?: string };
  providerId: { name: string; profileImage?: string };
  messages: any[];
}

export default function ChatList() {
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [MessageCircle, setMessageCircle] = useState<any>(null); // State for dynamic icon
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Dynamically import the MessageCircle icon
  useEffect(() => {
    const loadIcon = async () => {
      const { MessageCircle } = await import("lucide-react");
      setMessageCircle(() => MessageCircle);
    };
    loadIcon();
  }, []);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      // Ensure localStorage is accessed only on the client side
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        setUserRole(role);

        try {
          const res = await fetch("/api/chat", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setChats(data);
        } catch (error) {
          console.error("Failed to fetch chats:", error);
        }
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Messages
        </h1>
        <div className="bg-black/20 p-4 rounded-xl shadow-lg border border-gray-700">
          {chats.length === 0 ? (
            <p className="text-gray-300 text-center">No messages yet.</p>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li
                  key={chat._id}
                  className="flex items-center p-4 border-b border-gray-700 last:border-none hover:bg-white/10 rounded-xl transition cursor-pointer"
                  onClick={() => router.push(`/chat/${chat._id}`)}
                >
                  <Image
                    src={
                      userRole === "provider"
                        ? chat.charityId.profileImage || "/default-avatar.png"
                        : chat.providerId.profileImage || "/default-avatar.png"
                    }
                    alt="Profile"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border border-white shadow-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      {userRole === "provider"
                        ? chat.charityId.name
                        : chat.providerId.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {chat.messages[chat.messages.length - 1]?.text || "New chat"}
                    </p>
                  </div>
                  {MessageCircle && (
                    <MessageCircle className="text-blue-400 w-6 h-6" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <LoadingButton
          onClick={async () => {
            await router.push("/dashboard/provider"); // Ensures it returns a Promise
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-purple-700 transition"
        >
          Back to Dashboard
        </LoadingButton>
      </div>
    </div>
  );
}