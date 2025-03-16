"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { MessageCircle } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  profileImage: string;
}

export default function ChatList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const router = useRouter();

  // Dummy Contacts for Now
  useEffect(() => {
    setContacts([
      { id: "1", name: "John Doe", profileImage: "/default-avatar.png" },
      { id: "2", name: "Jane Smith", profileImage: "/default-avatar.png" },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-white/20">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Messages
        </h1>
        <div className="bg-black/20 p-4 rounded-xl shadow-lg border border-gray-700">
          {contacts.length === 0 ? (
            <p className="text-gray-300 text-center">No messages yet.</p>
          ) : (
            <ul>
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex items-center p-4 border-b border-gray-700 last:border-none hover:bg-white/10 rounded-xl transition cursor-pointer"
                  onClick={() => router.push(`/chat/${contact.id}`)}
                >
                  <img
                    src={contact.profileImage}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full border border-white shadow-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">
                      {contact.name}
                    </h3>
                  </div>
                  <MessageCircle className="text-blue-400 w-6 h-6" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Back Button */}
        <Link href="/dashboard/provider">
          <button className="mt-6 w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-md">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
