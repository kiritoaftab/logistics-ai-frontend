import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import MiniBarChart from "../chart/MiniBarChart";
import PlusBtn from "../btn/PlusBtn";
import AskPopover from "../ask/AskPopover";

export default function QueryNode({ data, id, selected }) {
  const {
    question,
    response,
    onFollowUp,
    isLoading,
    onDelete,
    onAddAround,
    onExpand,
    onCopy,
  } = data;

  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askRelated, setAskRelated] = useState([]);
  const [askBase, setAskBase] = useState("");

  const openAsk = () => {
    setAskText("");
    setAskBase(question);
    setAskRelated(response?.followUps || []);
    setAskOpen(true);
  };

  const submitAsk = () => {
    const q = askText.trim();
    if (!q) return;
    onAddAround?.(q);
    setAskOpen(false);
    setAskText("");
  };

  return (
    <div className={`relative bg-white border rounded-xl w-[340px] shadow-lg text-gray-800 overflow-visible ${
      selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      {/* Target Handle (TOP) - for incoming connections */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        className="w-2 h-2 bg-blue-600"
        style={{ top: -4 }}
      />
      
      {/* Source Handle (BOTTOM) - for outgoing connections */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        className="w-2 h-2 bg-blue-600"
        style={{ bottom: -4 }}
      />

      {/* Additional handles for left/right (hidden but available if needed) */}
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0.3, left: -4 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0.3, right: -4 }} />

      {/* ONLY BOTTOM PLUS BUTTON */}
      <PlusBtn
        className="left-1/2 -translate-x-1/2 -bottom-4"
        onClick={openAsk}
      />

      <AskPopover
        open={askOpen}
        value={askText}
        base={askBase}
        related={askRelated}
        onChange={setAskText}
        onSubmit={submitAsk}
        onRelatedSelect={(q) => {
          onAddAround?.(q);
          setAskOpen(false);
          setAskRelated([]);
          setAskBase("");
        }}
        onClose={() => {
          setAskOpen(false);
          setAskRelated([]);
          setAskBase("");
        }}
      />

      {/* HEADER */}
      <div className="drag-handle flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200 cursor-move rounded-t-xl">
        <div className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded">
          ?
        </div>
        <span className="font-medium text-xs text-gray-800 truncate flex-1">
          {question}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Copy"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            onClick={onExpand}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Expand"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M14 10l6-6M9 21H3v-6M10 14l-6 6"></path>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-3 space-y-3 text-xs">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ) : response ? (
          <>
            {/* Summary */}
            <p className="text-gray-700 leading-relaxed text-xs">
              {response.summary}
            </p>

            {/* Data Table */}
            {response.data && response.data.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      {Object.keys(response.data[0]).map((k) => (
                        <th
                          key={k}
                          className="px-2 py-1.5 text-left font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {k.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response.data.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-2 py-1.5 text-gray-700">
                            {typeof val === 'number' ? val.toLocaleString() : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Chart Section */}
            {response.chart && (
              <div className="mt-2">
                <h4 className="text-[10px] font-semibold text-gray-700 mb-2">
                  {response.chart.title}
                </h4>
                {response.chart.type === 'bar' && (
                  <div className="space-y-1.5">
                    {response.data.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-20 truncate">
                          {item[response.chart.x || Object.keys(item)[0]]}
                        </span>
                        <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded"
                            style={{ 
                              width: `${(item[response.chart.y || Object.keys(item)[1]] / Math.max(...response.data.map(d => d[response.chart.y || Object.keys(d)[1]]))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-700 w-12 text-right">
                          {typeof item[response.chart.y || Object.keys(item)[1]] === 'number' 
                            ? item[response.chart.y || Object.keys(item)[1]].toLocaleString() 
                            : item[response.chart.y || Object.keys(item)[1]]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
{/* Metrics Display */}
{response.metrics && Object.keys(response.metrics).length > 0 && (
  <div className="grid grid-cols-2 gap-2 mt-2">
    {Object.entries(response.metrics).map(([key, value]) => (
      <div key={key} className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="text-[9px] text-gray-500 uppercase">{key.replace(/_/g, ' ')}</div>
        <div className="text-sm font-semibold text-gray-800">{value}</div>
      </div>
    ))}
  </div>
)}

{/* Row Count and Execution Time */}
{response.rowCount && (
  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
    <span>{response.rowCount} row(s) returned</span>
    {response.executionTime && <span>{(response.executionTime / 1000).toFixed(2)}s</span>}
  </div>
)}
            {/* SQL Section */}
            {response.sql && (
              <details className="border border-gray-200 rounded-lg mt-2">
                <summary className="cursor-pointer px-2 py-1.5 bg-gray-50 text-[9px] font-medium text-gray-600">
                  VIEW SQL
                </summary>
                <pre className="px-2 py-2 text-[9px] font-mono text-gray-700 bg-gray-100 overflow-x-auto">
                  {response.sql}
                </pre>
              </details>
            )}

            {/* Follow-up Questions */}
            {response.followUps && response.followUps.length > 0 && (
              <div className="mt-2 space-y-1">
                <h4 className="text-[9px] font-medium text-gray-500 mb-1">Related:</h4>
                {response.followUps.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowUp(q)}
                    className="w-full text-left px-2 py-1.5 text-[10px] text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}