"use client";

import { useEffect, useState } from "react";

export const FilePreviewModal = ({
  file,
  onClose
}: {
  file: {
    url: string;
    type: 'image' | 'video' | 'document';
  } | null;
  onClose: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(!!file);

  useEffect(() => {
    setIsOpen(!!file);
  }, [file]);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">File Preview</h3>
          <button 
            onClick={() => {
              onClose();
              setIsOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {file.type === 'image' ? (
            <img 
              src={file.url} 
              alt="Preview" 
              className="max-w-full max-h-[70vh] mx-auto"
            />
          ) : file.type === 'video' ? (
            <video 
              src={file.url} 
              controls 
              className="max-w-full max-h-[70vh] mx-auto"
            />
          ) : (
            <div className="text-center p-4">
              <p className="mb-4">Document preview not available</p>
              <a 
                href={file.url} 
                download
                className="text-blue-500 hover:underline"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};