import React from 'react';

const PlusBtn = ({ className = "", onClick }) => {
  return (
    <button
      onClick={onClick}
      className={[
        "absolute z-20 w-6 h-6 rounded-full border border-gray-300 bg-white",
        "text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600",
        "flex items-center justify-center shadow-md transition-all duration-200",
        "text-sm font-medium",
        className,
      ].join(" ")}
      title="Add child node"
      type="button"
    >
      +
    </button>
  );
};

export default PlusBtn;