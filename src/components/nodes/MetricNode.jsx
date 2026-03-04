import React from 'react';
import { Handle, Position } from 'reactflow';
import { Activity, TrendingUp } from 'lucide-react';

export default function MetricNode({ data, id, selected }) {
  const { label, value, target, unit, trend, color = 'blue' } = data;
  const percentage = target ? (value / target) * 100 : null;

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`relative bg-white border rounded-lg w-[180px] shadow-md ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded ${colorClasses[color]}`}>
            <Activity size={14} />
          </div>
          <span className="text-xs text-gray-600 truncate flex-1">{label}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>

        {trend && (
          <div className="flex items-center gap-1 mt-1 text-[10px]">
            <TrendingUp size={10} className={trend > 0 ? 'text-green-600' : 'text-red-600'} />
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}

        {target && (
          <div className="mt-2">
            <div className="h-1 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="text-[9px] text-gray-500 mt-1">
              Target: {target.toLocaleString()}{unit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}