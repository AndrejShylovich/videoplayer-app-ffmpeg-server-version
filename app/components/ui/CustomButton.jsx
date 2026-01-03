import React from "react";

const CustomButton = ({
  children,
  onClick,
  active = false,
  className = "",
}) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full flex items-center justify-center 
      ${active ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}
      ${className}`}
  >
    {children}
  </button>
);

export default CustomButton;
