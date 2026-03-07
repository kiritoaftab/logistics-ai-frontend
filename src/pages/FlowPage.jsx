// src/pages/FlowPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { useSearchParams } from "react-router-dom";
import "reactflow/dist/style.css";

import QueryNode from "../components/nodes/QueryNode";
import InsightNode from "../components/nodes/InsightNode";
import MetricNode from "../components/nodes/MetricNode";
import NodeDetailsPanel from "../components/panels/NodeDetailsPanel";
import { getThreadById, sendQuery, sendFollowUp } from "../services/api";
import {
  ROOT_X,
  ROOT_Y,
  getChildPosition,
  toResponse,
  buildGraphFromApi,
} from "./components/helper";
import {
  Brain,
  Send,
  RefreshCw,
  Layers,
  ChevronDown,
  Filter,
  Download,
  Share2,
} from "lucide-react";

const nodeTypes = {
  queryNode: QueryNode,
  insightNode: InsightNode,
  metricNode: MetricNode,
};

export default function FlowPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlThreadId = searchParams.get("thread");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [inputValue, setInputValue] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  const rfWrapperRef = useRef(null);

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const threadIdRef = useRef(urlThreadId || null);
  const handleFollowUpRef = useRef(null);
  const handleAddAroundRef = useRef(null);

  const [nodeHeights, setNodeHeights] = useState({});
  const nodeHeightsRef = useRef({});
  const nodePositionsRef = useRef({});
  const pendingChildRef = useRef(null);

  const hasRelayoutRunRef = useRef(false);

  useEffect(() => {
    hasRelayoutRunRef.current = false;
  }, [urlThreadId]);

  useEffect(() => {
    nodeHeightsRef.current = nodeHeights;
  }, [nodeHeights]);

  useEffect(() => {
    nodePositionsRef.current = Object.fromEntries(
      nodes.map((node) => [node.id, node.position]),
    );
  }, [nodes]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    threadIdRef.current = urlThreadId || null;
  }, [urlThreadId]);

  const suggestedQueries = useMemo(
    () => [
      "What's my total ASNs last 30 days?",
      "What are the status of my various ASNs?",
      "Show me inventory by category",
      "Total revenue this month",
      "Pending putaway tasks",
    ],
    [],
  );

  const handleNodeHeightChange = useCallback((nodeId, height) => {
    setNodeHeights((prev) => {
      if (prev[nodeId] === height) return prev;
      return { ...prev, [nodeId]: height };
    });
  }, []);

  const attachHandlers = useCallback(
    (rawNodes) => {
      return rawNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLoading: !!node.data?.isLoading,
          onHeightChange: handleNodeHeightChange,
          onFollowUp: (question) =>
            handleFollowUpRef.current?.(question, node.id),
          onAddAround: (question) =>
            handleAddAroundRef.current?.(question, node.id),
          onDelete: () => {
            setNodes((prev) => prev.filter((n) => n.id !== node.id));
            setEdges((prev) =>
              prev.filter((e) => e.source !== node.id && e.target !== node.id),
            );
          },
          onExpand: () => {
            const latestNode =
              nodesRef.current.find((n) => n.id === node.id) || node;
            setSelectedNode(latestNode);
            setShowNodeDetails(true);
          },
          onCopy: () => {
            navigator.clipboard.writeText(
              JSON.stringify({ question: node.data?.question }, null, 2),
            );
          },
        },
      }));
    },
    [setNodes, setEdges, handleNodeHeightChange],
  );

  const resetFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setShowNodeDetails(false);
    setError(null);
  }, [setNodes, setEdges]);

  const loadThreadGraph = useCallback(
    async (threadId) => {
      if (!threadId) {
        resetFlow();
        return;
      }

      setIsExecuting(true);
      setError(null);

      try {
        const threadData = await getThreadById(threadId);

        const { nodes: graphNodes, edges: graphEdges } = buildGraphFromApi(
          threadData,
          nodePositionsRef.current,
          nodeHeightsRef.current,
          pendingChildRef.current,
        );

        setNodes(attachHandlers(graphNodes));
        setEdges(graphEdges);

        pendingChildRef.current = null;
      } catch (err) {
        console.error("Failed to load thread:", err);
        setError("Failed to load thread.");
        setNodes([]);
        setEdges([]);
      } finally {
        setIsExecuting(false);
      }
    },
    [attachHandlers, resetFlow, setNodes, setEdges],
  );

  const handleFollowUp = useCallback(
    async (question, parentId) => {
      if (!question?.trim()) return;

      const activeThreadId = threadIdRef.current;
      if (!activeThreadId) {
        setError("No thread selected. Create the first node first.");
        return;
      }

      setIsExecuting(true);
      setError(null);

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const parentNode = currentNodes.find((node) => node.id === parentId);
      if (!parentNode) {
        setError("Parent node not found.");
        setIsExecuting(false);
        return;
      }

      const childCount = currentEdges.filter(
        (edge) => edge.source === parentId,
      ).length;

      const parentHeight = nodeHeightsRef.current[parentId] || 260;
      const childPosition = getChildPosition(
        parentNode.position,
        childCount,
        parentHeight,
      );

      const tempId = `temp-${Date.now()}`;

      pendingChildRef.current = {
        parentId,
        question: question.trim(),
        position: childPosition,
      };

      const tempNode = {
        id: tempId,
        type: "queryNode",
        position: childPosition,
        data: {
          question,
          response: null,
          isLoading: true,
          onHeightChange: handleNodeHeightChange,
          onFollowUp: (q) => handleFollowUpRef.current?.(q, tempId),
          onAddAround: (q) => handleAddAroundRef.current?.(q, tempId),
          onDelete: () => {
            setNodes((prev) => prev.filter((n) => n.id !== tempId));
            setEdges((prev) =>
              prev.filter((e) => e.source !== tempId && e.target !== tempId),
            );
          },
          onExpand: () => {},
          onCopy: () => {
            navigator.clipboard.writeText(
              JSON.stringify({ question }, null, 2),
            );
          },
        },
      };

      const tempEdge = {
        id: `e-${parentId}-${tempId}`,
        source: parentId,
        sourceHandle: "bottom",
        target: tempId,
        targetHandle: "top",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#2563eb", strokeWidth: 2 },
      };

      setNodes((prev) => [...prev, tempNode]);
      setEdges((prev) => [...prev, tempEdge]);

      try {
        await sendFollowUp(question.trim(), activeThreadId, parentId);
        await loadThreadGraph(activeThreadId);
      } catch (err) {
        console.error("Failed to run follow-up:", err);
        setError(err?.message || "Failed to run follow-up.");

        pendingChildRef.current = null;
        setNodes((prev) => prev.filter((n) => n.id !== tempId));
        setEdges((prev) => prev.filter((e) => e.id !== tempEdge.id));
      } finally {
        setIsExecuting(false);
      }
    },
    [loadThreadGraph, setNodes, setEdges, handleNodeHeightChange],
  );

  const handleAddAround = useCallback(
    async (question, parentId) => {
      return handleFollowUp(question, parentId);
    },
    [handleFollowUp],
  );

  useEffect(() => {
    handleFollowUpRef.current = handleFollowUp;
  }, [handleFollowUp]);

  useEffect(() => {
    handleAddAroundRef.current = handleAddAround;
  }, [handleAddAround]);

  const addRootQuery = useCallback(
    async (question) => {
      if (!question?.trim()) return;

      setIsExecuting(true);
      setError(null);

      try {
        const activeThreadId = threadIdRef.current || null;
        const apiResp = await sendQuery(question.trim(), activeThreadId);

        const createdThreadId = apiResp?.thread_id || activeThreadId;
        const createdNodeId = apiResp?.node_id;

        if (createdThreadId) {
          threadIdRef.current = createdThreadId;
          setSearchParams({ thread: createdThreadId });
        }

        if (createdNodeId) {
          const createdNode = {
            id: createdNodeId,
            type: "queryNode",
            position: { x: ROOT_X, y: ROOT_Y },
            data: {
              question: apiResp.question,
              response: toResponse(apiResp),
            },
          };

          setNodes(attachHandlers([createdNode]));
          setEdges([]);
        }

        if (createdThreadId) {
          await loadThreadGraph(createdThreadId);
        }
      } catch (err) {
        console.error("Failed to run root query:", err);
        setError(err?.message || "Failed to run query.");
      } finally {
        setIsExecuting(false);
      }
    },
    [attachHandlers, loadThreadGraph, setNodes, setEdges, setSearchParams],
  );

  useEffect(() => {
    if (urlThreadId) {
      loadThreadGraph(urlThreadId);
    } else {
      resetFlow();
    }
  }, [urlThreadId, loadThreadGraph, resetFlow]);

  const onNodeClick = useCallback((_, node) => {
    // setSelectedNode(node);
    // setShowNodeDetails(true);
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((prev) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#2563eb", strokeWidth: 2 },
          },
          prev,
        ),
      ),
    [setEdges],
  );

  const relayoutCurrentGraph = useCallback(async () => {
    const activeThreadId = threadIdRef.current;
    if (!activeThreadId) return;

    try {
      const threadData = await getThreadById(activeThreadId);

      const { nodes: graphNodes, edges: graphEdges } = buildGraphFromApi(
        threadData,
        {}, // do not reuse old positions for full relayout
        nodeHeightsRef.current,
        null,
      );

      setNodes(attachHandlers(graphNodes));
      setEdges(graphEdges);
    } catch (err) {
      console.error("Failed to relayout graph:", err);
    }
  }, [attachHandlers, setNodes, setEdges]);

  useEffect(() => {
    if (!urlThreadId) return;
    if (nodes.length === 0) return;

    const allMeasured = nodes.every((node) => nodeHeightsRef.current[node.id]);

    if (allMeasured && !hasRelayoutRunRef.current) {
      hasRelayoutRunRef.current = true;
      relayoutCurrentGraph();
    }
  }, [nodes, nodeHeights, urlThreadId, relayoutCurrentGraph]);

  const titleText = urlThreadId
    ? `Thread: ${urlThreadId.slice(0, 8)}...`
    : "New Thread";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Layers size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {titleText}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
            {nodes.length} nodes
          </span>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Filter size={12} /> Filter
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Download size={12} /> Export
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <Share2 size={12} /> Share
          </button>
        </div>
      </div>

      <div className="flex-1 relative" ref={rfWrapperRef}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#2563eb", strokeWidth: 2 },
            }}
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
            <MiniMap
              className="bg-white border border-gray-200 rounded-lg"
              nodeColor="#2563eb"
            />

            {nodes.length === 0 && (
              <Panel position="top-center" className="mt-16">
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8 max-w-lg text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain size={40} className="text-blue-600" />
                  </div>

                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Ask your warehouse anything
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Type a question below to start your thread.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {suggestedQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => addRootQuery(query)}
                        className="text-left px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700"
                      >
                        {query}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inputValue.trim()) {
                          addRootQuery(inputValue.trim());
                          setInputValue("");
                        }
                      }}
                      placeholder="Ask your warehouse anything..."
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          addRootQuery(inputValue.trim());
                          setInputValue("");
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </Panel>
            )}

            {isExecuting && (
              <Panel position="bottom-right" className="mb-4 mr-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  <span className="text-xs text-gray-600">
                    AI is analyzing...
                  </span>
                </div>
              </Panel>
            )}

            {error && (
              <Panel position="top-right" className="mt-4 mr-4">
                <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-red-600">
                  <span className="text-xs">Error: {error}</span>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {showNodeDetails && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setShowNodeDetails(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .react-flow__handle-bottom { bottom: -4px !important; }
        .react-flow__handle-top { top: -4px !important; }
      `}</style>
    </div>
  );
}
