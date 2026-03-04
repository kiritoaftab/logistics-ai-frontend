import React, { useState } from 'react';
import { 
  X, Maximize2, Minimize2, Copy, Download, Share2, 
  Code, BarChart3, Table, FileText, Terminal, Clock 
} from 'lucide-react';

export default function NodeDetailsPanel({ node, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!node) return null;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(node.data, null, 2));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(node.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `node-${node.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Summary</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                {node.data?.response?.summary || 'No summary available'}
              </p>
            </div>

            {node.data?.response?.insights && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Insights</h4>
                <ul className="space-y-1">
                  {node.data.response.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-600 rounded-full mt-2" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'data':
        return node.data?.response?.data ? (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {Object.keys(node.data.response.data[0]).map(key => (
                    <th key={key} className="text-left py-2 px-2 text-gray-600 font-medium border-b border-gray-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {node.data.response.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="py-2 px-2 text-gray-700">
                        {typeof val === 'number' ? val.toLocaleString() : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No data available</p>
        );

      case 'sql':
        return node.data?.response?.sql ? (
          <pre className="text-xs font-mono bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-[400px]">
            {node.data.response.sql}
          </pre>
        ) : (
          <p className="text-sm text-gray-500">No SQL query available</p>
        );

      case 'metrics':
        return node.data?.response?.metrics ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(node.data.response.metrics).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">{key}</div>
                <div className="text-lg font-semibold text-gray-800">
                  {typeof value === 'object' ? value.current : value}
                </div>
                {typeof value === 'object' && value.trend && (
                  <div className={`text-xs mt-1 ${value.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {value.trend}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No metrics available</p>
        );

      case 'history':
        return (
          <div className="text-sm text-gray-500 text-center py-8">
            <Clock size={24} className="mx-auto mb-2 text-gray-400" />
            <p>No history available</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-0 right-0 bottom-0 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col transition-all duration-300 ${
      isFullScreen ? 'w-full' : 'w-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
            <BarChart3 size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              {node.data?.question || 'Node Details'}
            </h3>
            <p className="text-xs text-gray-500">ID: {node.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullScreen} 
            className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-gray-200 bg-gray-50">
        {['overview', 'data', 'sql', 'metrics', 'history'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 bg-white rounded hover:bg-gray-50"
          >
            <Copy size={12} /> Copy
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 bg-white rounded hover:bg-gray-50"
          >
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 bg-white rounded hover:bg-gray-50">
            <Share2 size={12} /> Share
          </button>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-800 text-white rounded hover:bg-gray-700">
          <Terminal size={12} /> Execute
        </button>
      </div>
    </div>
  );
}