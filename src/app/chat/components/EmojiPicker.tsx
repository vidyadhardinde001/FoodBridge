"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

const emojis = ["😀", "😂", "😍", "🤔", "👍", "❤️", "🔥", "🎉", "🙏", "👋"];

export const EmojiPicker = ({ 
  onSelect,
  onClose 
}: {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-10 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
          <div className="grid grid-cols-5 gap-1">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                  onClose?.();
                }}
                className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};