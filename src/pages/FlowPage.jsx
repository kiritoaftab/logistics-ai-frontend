import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "../sidebar/Sidebar";
import QueryNode from "../components/nodes/QueryNode";
import InsightNode from "../components/nodes/InsightNode";
import MetricNode from "../components/nodes/MetricNode";
import NodeDetailsPanel from "../components/panels/NodeDetailsPanel";
import { getMockResponse } from "../utils/mockData";

import {
  Brain,
  Send,
  Mic,
  Paperclip,
  Zap,
  Filter,
  Download,
  Share2,
  RefreshCw,
  Layers,
  ChevronDown,
} from "lucide-react";

const nodeTypes = {
  queryNode: QueryNode,
  insightNode: InsightNode,
  metricNode: MetricNode,
};

// Tree structure layout calculator
const calculateTreePosition = (parentNode, childIndex) => {
  if (!parentNode) {
    return { x: 500, y: 100 };
  }

  const verticalSpacing = 200;
  const horizontalSpacing = 300;

  if (childIndex === 0) {
    return {
      x: parentNode.position.x,
      y: parentNode.position.y + verticalSpacing,
    };
  } else {
    const isLeft = childIndex % 2 === 1;
    const level = Math.floor((childIndex + 1) / 2);
    const direction = isLeft ? -1 : 1;
    
    return {
      x: parentNode.position.x + (direction * level * horizontalSpacing),
      y: parentNode.position.y + verticalSpacing,
    };
  }
};

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [inputValue, setInputValue] = useState("");
  const [activeThread, setActiveThread] = useState("t-1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const nodeCounter = useRef(0);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [threads, setThreads] = useState([
    { id: "t-1", title: "Performance Metrics", nodeCount: 0, time: "2 min ago", lastQuery: "Warehouse performance metrics" },
    { id: "t-2", title: "Inventory Analysis", nodeCount: 0, time: "15 min ago", lastQuery: "Show me inventory by category" },
    { id: "t-3", title: "Billing Summary", nodeCount: 0, time: "1 hour ago", lastQuery: "Total revenue this month" },
  ]);

  const [user] = useState({ name: "John Smith" });

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      animated: true,
      style: { stroke: "#2563eb", strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setShowNodeDetails(true);
  }, []);

  const addQueryNode = useCallback((question, parentNodeId = null) => {
    const id = `query-${++nodeCounter.current}`;
    
    let position;
    const parentNode = parentNodeId ? nodes.find(n => n.id === parentNodeId) : null;
    
    if (!parentNode) {
      position = { x: 500, y: 100 };
    } else {
      const existingChildren = nodes.filter(n => 
        edges.some(e => e.source === parentNodeId && e.target === n.id)
      ).length;
      
      position = calculateTreePosition(parentNode, existingChildren);
    }

    const newNode = {
      id,
      type: "queryNode",
      position,
      data: {
        question,
        response: null,
        isLoading: true,
        onFollowUp: (q) => addQueryNode(q, id),
        onAddAround: (q) => addQueryNode(q, id),
        onDelete: () => {
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        },
        onExpand: () => {
          setSelectedNode({ id, data: { question, response: null } });
          setShowNodeDetails(true);
        },
        onCopy: () => {
          navigator.clipboard.writeText(JSON.stringify({ question }, null, 2));
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (parentNodeId) {
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${parentNodeId}-${id}`,
          source: parentNodeId,
          sourceHandle: 'bottom',
          target: id,
          targetHandle: 'top',
          animated: true,
          style: { stroke: "#2563eb", strokeWidth: 2 },
        },
      ]);
    }

    setIsExecuting(true);
    setTimeout(() => {
      const response = getMockResponse(question);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, response, isLoading: false } }
            : n
        )
      );
      setIsExecuting(false);

      setThreads((ts) =>
        ts.map((t) =>
          t.id === activeThread 
            ? { ...t, nodeCount: t.nodeCount + 1, lastQuery: question } 
            : t
        )
      );
    }, 1500);
  }, [setNodes, setEdges, activeThread, reactFlowInstance, nodes, edges]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addQueryNode(inputValue.trim());
    setInputValue("");
  };

  const handleNewThread = () => {
    const id = `t-${Date.now()}`;
    setThreads((ts) => [
      { id, title: "New Thread", nodeCount: 0, time: "Just now", lastQuery: "Start a new query" },
      ...ts,
    ]);
    setActiveThread(id);
    setNodes([]);
    setEdges([]);
    nodeCounter.current = 0;
  };

  const suggestedQueries = [
    "Warehouse performance metrics",
    "Show me inventory by category",
    "Total revenue this month",
    "Items below reorder threshold",
    "Pending putaway tasks",
  ];

  return (
    <div className="flex w-screen h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <Sidebar
        threads={threads}
        activeThread={activeThread}
        onSelectThread={setActiveThread}
        onNewThread={handleNewThread}
        user={user}
        onLogout={() => {}}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <Layers size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {threads.find(t => t.id === activeThread)?.title || "New Thread"}
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

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={2}
              defaultEdgeOptions={{
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
                      Type a question below to start your tree.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedQueries.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => addQueryNode(q)}
                          className="text-left px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </Panel>
              )}

              {isExecuting && (
                <Panel position="bottom-right" className="mb-4 mr-4">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-blue-600" />
                    <span className="text-xs text-gray-600">AI is analyzing...</span>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Brain size={18} className="text-blue-600" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 py-2.5 bg-transparent border-none text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg">
                <Mic size={18} />
              </button>
              <button type="button" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg">
                <Paperclip size={18} />
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                  inputValue.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <Zap size={10} className="text-yellow-600" /> Tree structure • Bottom → Left → Right → Further left → Further right
            </span>
            <span>Press Enter to send</span>
          </div>
        </form>
      </div>

      {/* Node Details Panel */}
      {showNodeDetails && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setShowNodeDetails(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .react-flow__handle-bottom {
          bottom: -4px !important;
        }
        
        .react-flow__handle-top {
          top: -4px !important;
        }
      `}</style>
    </div>
  );
}