import React from 'react';
import { Handle, Position } from 'reactflow';

export default function InsightNode({ data, id, selected }) {
  const { title, value, type = 'info' } = data;

  const getColors = () => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className={`relative bg-white border rounded-lg w-[220px] shadow-md ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="p-3">
        <div className={`text-xs font-medium ${getColors()}`}>
          {title}
        </div>
        <div className="text-lg font-semibold text-gray-800 mt-1">
          {value}
        </div>
      </div>
    </div>
  );
}