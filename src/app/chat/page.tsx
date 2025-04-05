"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingButton from "../components/LoadingButton";
import { MessageCircle } from "lucide-react";

interface User {
  name: string;
  profileImage?: string;
}

interface ChatContact {
  _id: string;
  charityId: User | null;
  providerId: User | null;
  messages: any[];
  lastMessage?: {
    text: string;
    timestamp: Date;
  };
}

export default function ChatList() {
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch chats with proper error handling
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          const role = localStorage.getItem("role");
          setUserRole(role);

          const res = await fetch("/api/chat", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch chats");
          }

          const data = await res.json();
          setChats(data.map((chat: any) => ({
            ...chat,
            lastMessage: chat.messages?.length > 0 
              ? {
                  text: chat.messages[chat.messages.length - 1].text,
                  timestamp: new Date(chat.messages[chat.messages.length - 1].timestamp)
                } 
              : undefined
          })));
        }
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const getProfileImage = (chat: ChatContact) => {
    const user = userRole === "provider" ? chat.charityId : chat.providerId;
    return user?.profileImage || "/default-avatar.png";
  };

  const getDisplayName = (chat: ChatContact) => {
    const user = userRole === "provider" ? chat.charityId : chat.providerId;
    return user?.name || "Unknown User";
  };

  const formatMessagePreview = (text?: string) => {
    if (!text) return "New chat";
    return text.length > 30 ? `${text.substring(0, 30)}...` : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-100 rounded-lg max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold text-center">Messages</h1>
        </div>

        {/* Chat List */}
        <div className="divide-y divide-gray-200">
          {chats.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li
                  key={chat._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/chat/${chat._id}`)}
                >
                  <div className="flex items-center p-4 space-x-4">
                    <div className="relative">
                      <Image
                        src={getProfileImage(chat)}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full h-12 w-12 object-cover border-2 border-white shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/default-avatar.png";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {getDisplayName(chat)}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {formatMessagePreview(chat.lastMessage?.text)}
                      </p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <LoadingButton
            onClick={async () => {
              await router.push("/dashboard/provider");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Back to Dashboard
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}