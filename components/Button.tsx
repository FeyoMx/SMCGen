
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ isLoading, children, ...props }) => {
  return (
    <button
      {...props}
      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200
        ${isLoading
          ? 'bg-blue-400 cursor-not-allowed dark:bg-blue-500'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 dark:active:bg-blue-900'
        }
        ${props.className || ''} flex items-center justify-center space-x-2`}
      disabled={isLoading || props.disabled}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;