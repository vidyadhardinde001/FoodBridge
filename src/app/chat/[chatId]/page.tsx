"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPhone, 
  FaVideo, 
  FaPaperclip, 
  FaRegSmile, 
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaMicrophone
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { EmojiPicker } from "../components/EmojiPicker";
import { FilePreviewModal } from "../components/FilePreviewModal";
import Image from "next/image";
import { connectSocket, getSocket } from "@/lib/socket-client";
import { format } from "date-fns";

type Message = {
  _id: string;
  sender: string;
  text: string;
  timestamp: string;
  read?: boolean;
  temporary?: boolean;
  tempId?: string;
  attachments?: Array<{
    url: string;
    type: 'image' | 'video' | 'document';
    name?: string;
  }>;
};

export default function ChatUI() {
  const { chatId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState({
    name: "Loading...",
    image: "/default-avatar.png",
    status: "online",
    lastSeen: null as Date | null
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: 'image' | 'video' | 'document';
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socket = getSocket();

  // Initialize user role
  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
  }, []);

  // Load chat details
  useEffect(() => {
    if (!userRole) return;
    
    const loadChatDetails = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        const chat = await res.json();

        const isProvider = userRole === "provider";
        const contact = isProvider ? chat.charityId : chat.providerId;
        setOtherUser({
          name: contact?.name || "Unknown User",
          image: contact?.profileImage || "/default-avatar.png",
          status: chat.isOnline ? "online" : "last seen " + format(new Date(chat.lastSeen), 'hh:mm a'),
          lastSeen: chat.lastSeen ? new Date(chat.lastSeen) : null
        });

        setMessages(chat.messages);
      } catch (error) {
        console.error("Failed to load chat details:", error);
      }
    };

    loadChatDetails();
  }, [chatId, userRole]);

  // Socket connection and message handling
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = connectSocket(token!);

    socket?.emit("join-chat", chatId);

    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        const existingTempIndex = prev.findIndex(
          msg => msg.tempId && msg.text === message.text
        );

        if (existingTempIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[existingTempIndex] = message;
          return updatedMessages;
        }
        return [...prev, message];
      });
      scrollToBottom();
    };

    const handleMessageRead = (messageId: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    };

    socket?.on("new-message", handleNewMessage);
    socket?.on("message-read", handleMessageRead);

    return () => {
      socket?.off("new-message", handleNewMessage);
      socket?.off("message-read", handleMessageRead);
      socket?.emit("leave-chat", chatId);
    };
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (!input.trim() && files.length === 0) return;
    const userId = localStorage.getItem("userId");

    // Create temporary message
    const tempMessage: Message = {
      _id: Date.now().toString(),
      text: input,
      sender: userRole!,
      timestamp: new Date().toISOString(),
      temporary: true,
      tempId: Date.now().toString(),
      ...(files.length > 0 && {
        attachments: files.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image') ? 'image' : 
                file.type.startsWith('video') ? 'video' : 'document',
          name: file.name
        }))
      })
    };

    setMessages(prev => [...prev, tempMessage]);
    setInput("");
    setFiles([]);

    // Send message to server
    socket?.emit("send-message", {
      chatId,
      text: input,
      sender: userRole,
      userId,
      attachments: files.length > 0 ? files : undefined
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const initiateCall = (isVideo: boolean) => {
    // In a real app, this would connect to your calling service
    if (typeof window !== "undefined" && window.navigator) {
      const phoneNumber = "1234567890"; // Replace with actual number from user data
      if (isVideo) {
        window.open(`https://meet.example.com/${chatId}`, '_blank');
      } else {
        window.open(`tel:${phoneNumber}`, '_blank');
      }
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Actual recording implementation would go here
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.back()}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Image
            src={otherUser.image}
            alt={otherUser.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="font-semibold">{otherUser.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {otherUser.status}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => initiateCall(false)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
          >
            <FaPhone className="text-lg" />
          </button>
          <button 
            onClick={() => initiateCall(true)}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
          >
            <FaVideo className="text-lg" />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400">
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg._id || msg.tempId}
              className={`flex mb-4 ${msg.sender === userRole ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`flex flex-col max-w-xs lg:max-w-md ${msg.sender === userRole ? "items-end" : "items-start"}`}
              >
                {msg.sender !== userRole && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {otherUser.name}
                  </span>
                )}
                <div
                  className={`p-3 rounded-lg ${msg.sender === userRole ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"}`}
                >
                  {msg.text}
                  {msg.attachments?.map((attachment, idx) => (
                    <div key={idx} className="mt-2">
                      {attachment.type === 'image' ? (
                        <Image
                          src={attachment.url}
                          alt="Attachment"
                          width={200}
                          height={200}
                          className="rounded-lg cursor-pointer"
                          onClick={() => setPreviewFile(attachment)}
                        />
                      ) : (
                        <div 
                          className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center"
                          onClick={() => setPreviewFile(attachment)}
                        >
                          <FaPaperclip className="mr-2" />
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-1 space-x-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(msg.timestamp), 'hh:mm a')}
                  </span>
                  {msg.sender === userRole && (
                    <span className="text-xs">
                      {msg.read ? (
                        <FaCheckDouble className="text-blue-500" />
                      ) : (
                        <FaCheck className="text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex overflow-x-auto space-x-2">
            {files.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image') ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="rounded-lg object-cover h-20 w-20"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FaPaperclip className="text-2xl" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
          >
            <FaPaperclip className="text-lg" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
          </button>
          {isRecording ? (
            <button 
              onClick={toggleRecording}
              className="flex-1 mx-2 p-2 bg-red-500 text-white rounded-lg flex items-center justify-center"
            >
              <FaMicrophone className="mr-2" />
              Recording... Tap to stop
            </button>
          ) : (
            <>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <FaRegSmile className="text-lg" />
              </button>
              <div className="flex-1 mx-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a message..."
                />
              </div>
            </>
          )}
          <button
            onClick={isRecording ? toggleRecording : handleSendMessage}
            disabled={!input.trim() && files.length === 0 && !isRecording}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isRecording ? (
              <FaMicrophone className="text-lg" />
            ) : (
              <IoSend className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-10">
          <EmojiPicker 
            onSelect={(emoji) => {
              setInput(prev => prev + emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal 
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}