// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="w-16 h-16 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
