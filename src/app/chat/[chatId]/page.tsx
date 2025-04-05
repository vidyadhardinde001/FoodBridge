  // chat/[chatId]/page.tsx
  "use client";

  import { useState, useEffect, useRef, useCallback } from "react";
  import { useParams } from "next/navigation";
  import { motion, AnimatePresence } from "framer-motion";
  import { 
    FaPaperclip, 
    FaRegSmile, 
    FaArrowRight, 
    FaEllipsisV,
    FaCheck,
    FaCheckDouble,
    FaPhone,
    FaVideo
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [otherUser, setOtherUser] = useState({
      name: "Loading...",
      image: "/default-avatar.png",
      status: "online"
    });
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previewFile, setPreviewFile] = useState<{
      url: string;
      type: 'image' | 'video' | 'document';
    } | null>(null);
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
            name: contact?.name || "Unknown",
            image: contact?.profileImage || "/default-avatar.png",
            status: chat.isOnline
              ? "online"
              : "last seen " + format(new Date(chat.lastSeen), "hh:mm a"),
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

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Main Chat Container */}
        <div className="w-full max-w-4xl h-screen flex flex-col bg-white dark:bg-gray-800 shadow-xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {otherUser.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {otherUser.status}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                <FaPhone className="text-lg" />
              </button>
              <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                <FaVideo className="text-lg" />
              </button>
              <button className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
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
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <FaRegSmile className="text-lg" />
              </button>
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
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() && files.length === 0}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <IoSend className="text-lg" />
              </button>
            </div>
          </div>
        </div>

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