import React, { useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import PlusBtn from "../btn/PlusBtn";
import AskPopover from "../ask/AskPopover";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const PAGE_SIZE = 5;
const CHART_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded shadow px-2 py-1 text-[10px]">
      {label && <p className="text-gray-500 mb-0.5">{label}</p>}
      <p className="font-semibold text-gray-800">{Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

const ChartRenderer = ({ chartType, data, xKey, yKey }) => {
  const keys = Object.keys(data[0] || {});
  const resolvedX = xKey || keys[0];
  const resolvedY = yKey || keys[1];

  const chartData = data.map((d) => ({
    ...d,
    [resolvedY]: Number(d[resolvedY]) || 0,
  }));

  const tickFormatter = (v) =>
    typeof v === "string" && v.length > 10 ? v.slice(0, 10) + "…" : v;

  if (chartType === "bar" || chartType === "number") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey={resolvedX} tick={{ fontSize: 9 }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={resolvedY} fill="#2563eb" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey={resolvedX} tick={{ fontSize: 9 }} tickFormatter={tickFormatter} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={resolvedY} stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey={resolvedY}
            nameKey={resolvedX}
            cx="50%"
            cy="50%"
            outerRadius={70}
            label={({ name, percent }) =>
              `${String(name).slice(0, 8)} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default function QueryNode({ data, id, selected }) {
  const containerRef = useRef(null);

  const {
    question,
    onFollowUp,
    isLoading,
    onDelete,
    onAddAround,
    onExpand,
    onCopy,
    onHeightChange,
  } = data;

  const response = useMemo(() => {
    if (data?.response) return data.response;

    return {
      summary: data?.summary || "",
      data: data?.data || [],
      rowCount: data?.rowCount ?? data?.row_count ?? 0,
      sql: data?.sql || data?.sql_generated || "",
      followUps: data?.followUps || data?.follow_ups || [],
      chart: data?.chart || data?.chart_suggestion || null,
      executionTime: data?.executionTime ?? data?.execution_time_ms ?? null,
      metrics: data?.metrics || {},
      error: data?.error || null,
    };
  }, [data]);

  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askRelated, setAskRelated] = useState([]);
  const [askBase, setAskBase] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [response]);

  useEffect(() => {
    if (!containerRef.current) return;

    const reportHeight = () => {
      const height = containerRef.current.offsetHeight;
      onHeightChange?.(id, height);
    };

    reportHeight();

    const resizeObserver = new ResizeObserver(() => {
      reportHeight();
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [id, onHeightChange, response, isLoading, askOpen]);

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

  const tableData = Array.isArray(response?.data) ? response.data : [];
  const hasTable = tableData.length > 0;

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const paginatedData = tableData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const chartType = response?.chart?.type || response?.chart?.chart_type;
  const chartTitle = response?.chart?.title || "Chart";

  return (
    <div
      ref={containerRef}
      className={`relative bg-white border rounded-xl w-[440px] shadow-lg text-gray-800 overflow-visible ${
        selected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-2 h-2 bg-blue-600"
        style={{ top: -4 }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-2 h-2 bg-blue-600"
        style={{ bottom: -4 }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ opacity: 0.3, left: -4 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ opacity: 0.3, right: -4 }}
      />

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

      <div className="drag-handle flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-200 cursor-move rounded-t-xl">
        <div className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded">
          ?
        </div>

        <span className="font-medium text-xs text-gray-800 truncate flex-1">
          {question || "Untitled Question"}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Copy"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          <button
            onClick={onExpand}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Expand"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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

      <div className="p-3 space-y-3 text-xs">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ) : response?.error ? (
          <div className="text-red-600 text-xs">{response.error}</div>
        ) : (
          <>
            {response?.summary && (
              <p className="text-gray-700 leading-relaxed text-xs">
                {response.summary}
              </p>
            )}

            {hasTable && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      {Object.keys(tableData[0]).map((k) => (
                        <th
                          key={k}
                          className="px-2 py-1.5 text-left font-medium text-gray-600 uppercase tracking-wider"
                        >
                          {k.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-2 py-1.5 text-gray-700">
                            {typeof val === "number"
                              ? val.toLocaleString()
                              : String(val ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {tableData.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between px-2 py-2 border-t bg-white text-[10px]">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2 py-1 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>

                    <span>
                      Page {page} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-2 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {response?.chart && chartType && chartType !== "none" && chartType !== "table" && hasTable && (
              <div className="mt-2">
                <h4 className="text-[10px] font-semibold text-gray-700 mb-2">
                  {chartTitle}
                </h4>
                <ChartRenderer
                  chartType={chartType}
                  data={tableData}
                  xKey={response.chart.x || response.chart.x_axis}
                  yKey={response.chart.y || response.chart.y_axis}
                />
              </div>
            )}

            {response?.metrics && Object.keys(response.metrics).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(response.metrics).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 p-2 rounded border border-gray-200"
                  >
                    <div className="text-[9px] text-gray-500 uppercase">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {String(value)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(response?.rowCount || response?.executionTime) && (
              <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                <span>
                  {response?.rowCount
                    ? `${response.rowCount} row(s) returned`
                    : ""}
                </span>
                <span>
                  {response?.executionTime
                    ? `${(response.executionTime / 1000).toFixed(2)}s`
                    : ""}
                </span>
              </div>
            )}

            {response?.sql && (
              <details className="border border-gray-200 rounded-lg mt-2">
                <summary className="cursor-pointer px-2 py-1.5 bg-gray-50 text-[9px] font-medium text-gray-600">
                  VIEW SQL
                </summary>
                <pre className="px-2 py-2 text-[9px] font-mono text-gray-700 bg-gray-100 overflow-x-auto whitespace-pre-wrap">
                  {response.sql}
                </pre>
              </details>
            )}

            {response?.followUps && response.followUps.length > 0 && (
              <div className="mt-2 space-y-1">
                <h4 className="text-[9px] font-medium text-gray-500 mb-1">
                  Related:
                </h4>

                {response.followUps.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onFollowUp?.(q)}
                    className="w-full text-left px-2 py-1.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
