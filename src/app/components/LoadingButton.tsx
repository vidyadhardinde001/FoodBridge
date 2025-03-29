// components/LoadingButton.tsx
'use client';

import { ReactNode, MouseEvent } from 'react';

interface LoadingButtonProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => Promise<void>;
  children: ReactNode;
  className?: string;
  loadingText?: string;
}

export default function LoadingButton({
  onClick,
  children,
  className = '',
  loadingText = 'Processing...',
  ...props
}: LoadingButtonProps) {
  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    
    // Set loading state
    button.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${loadingText}
      </span>
    `;
    button.disabled = true;

    try {
      await onClick(e); // Will wait for the promise to resolve
    } finally {
      // Restore original state
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`${className} transition`}
    >
      {children}
    </button>
  );
}