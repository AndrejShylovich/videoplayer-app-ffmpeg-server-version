import React from "react";

/**
 * CustomButton component
 *
 * Reusable button with active/inactive styles.
 */
const CustomButton = ({ children, onClick, active = false, className = "" }) => {
  // Base styles for all buttons
  const baseStyles = "p-2 rounded-full flex items-center justify-center transition-colors duration-200";

  // Styles when button is active
  const activeStyles = "bg-blue-500 text-white";

  // Styles when button is inactive
  const inactiveStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${active ? activeStyles : inactiveStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
