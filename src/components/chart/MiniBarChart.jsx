import React from 'react';

const MiniBarChart = ({ data, xKey, yKey }) => {
  const maxVal = Math.max(...data.map(d => d[yKey]));

  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 truncate">
            {d[xKey]}
          </span>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded"
              style={{ width: `${(d[yKey] / maxVal) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-16 text-right">
            {d[yKey].toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MiniBarChart;