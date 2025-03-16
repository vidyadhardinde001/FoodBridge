"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import React from "react";

interface Contact {
  id: string;
  name: string;
  profileImage: string;
}

export default function ChatList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Simulated list of people who contacted the provider
    const dummyContacts: Contact[] = [
      { id: "1", name: "John Doe", profileImage: "/john.png" },
      { id: "2", name: "Jane Smith", profileImage: "/jane.png" },
      { id: "3", name: "Alex Johnson", profileImage: "/alex.png" },
    ];

    setContacts(dummyContacts);
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
                <img
                  src={contact.profileImage || "/default-avatar.png"}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{contact.name}</h3>
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
