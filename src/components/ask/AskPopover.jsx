import React, { useMemo } from 'react';

const AskPopover = ({
  open,
  value,
  onChange,
  onSubmit,
  onClose,
  related,
  onRelatedSelect,
  base,
}) => {
  if (!open) return null;

  return (
    <div className="absolute z-30 w-[280px] rounded-xl border border-gray-200 bg-white shadow-xl left-1/2 -translate-x-1/2 -bottom-[160px]">
      <div className="px-3 py-2 border-b border-gray-200">
        <h4 className="text-xs font-medium text-gray-800">NEW QUESTION</h4>
        {base && (
          <p className="text-[10px] text-gray-500 mt-0.5">Related to: {base}</p>
        )}
      </div>

      <div className="p-3 space-y-2">
        {related && related.length > 0 && (
          <div className="space-y-1 max-h-24 overflow-auto">
            {related.map((r, i) => (
              <button
                key={i}
                onClick={() => onRelatedSelect?.(r)}
                className="w-full text-left px-2 py-1 text-[10px] text-blue-600 hover:bg-blue-50 rounded"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type and press Enter..."
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") onSubmit();
          }}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 py-1 text-[10px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskPopover;