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
import { 
  sendQuery, 
  sendFollowUp, 
  getThreads, 
  getThreadById, 
  deleteThread,
  transformResponse 
} from "../services/api";

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
  const [activeThread, setActiveThread] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiThreadId, setApiThreadId] = useState(null);
  const [error, setError] = useState(null);
  const [threads, setThreads] = useState([]);
  
  const nodeCounter = useRef(0);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [user] = useState({ name: "John Smith" });

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Load threads from API
  const loadThreads = async () => {
    try {
      const data = await getThreads(20);
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  // Load a specific thread by ID
  const loadThread = useCallback(async (threadId) => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const threadData = await getThreadById(threadId);
      
      // Clear existing nodes
      setNodes([]);
      setEdges([]);
      nodeCounter.current = 0;
      
      // Set API thread ID
      setApiThreadId(threadId);
      setActiveThread(threadId);
      
      // Create a map to store node positions
      const nodePositions = {};
      const rootNodes = threadData.nodes.filter(n => !n.parent_node_id);
      
      // Position root nodes
      rootNodes.forEach((node, index) => {
        const nodeId = `query-${++nodeCounter.current}`;
        const position = { x: 500 + (index * 100), y: 100 };
        nodePositions[node.node_id] = { id: nodeId, position };
        
        const transformedResponse = transformResponse(node);
        
        const newNode = {
          id: nodeId,
          type: "queryNode",
          position,
          data: {
            question: node.question,
            response: transformedResponse,
            isLoading: false,
            onFollowUp: (q) => handleFollowUp(q, nodeId),
            onAddAround: (q) => handleAddAround(q, nodeId),
            onDelete: () => {
              setNodes((nds) => nds.filter((n) => n.id !== nodeId));
              setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            },
            onExpand: () => {
              setSelectedNode({ id: nodeId, data: { question: node.question, response: transformedResponse } });
              setShowNodeDetails(true);
            },
            onCopy: () => {
              navigator.clipboard.writeText(JSON.stringify({ question: node.question }, null, 2));
            },
          },
        };
        
        setNodes((nds) => [...nds, newNode]);
      });
      
      // Position child nodes
      const childNodes = threadData.nodes.filter(n => n.parent_node_id);
      
      childNodes.forEach((node) => {
        const parentInfo = nodePositions[node.parent_node_id];
        if (!parentInfo) return;
        
        // Find existing children count for this parent
        const existingChildren = Object.values(nodePositions).filter(
          p => p.parentId === node.parent_node_id
        ).length;
        
        const position = calculateTreePosition(
          { position: parentInfo.position },
          existingChildren
        );
        
        const nodeId = `query-${++nodeCounter.current}`;
        nodePositions[node.node_id] = { 
          id: nodeId, 
          position,
          parentId: node.parent_node_id 
        };
        
        const transformedResponse = transformResponse(node);
        
        const newNode = {
          id: nodeId,
          type: "queryNode",
          position,
          data: {
            question: node.question,
            response: transformedResponse,
            isLoading: false,
            onFollowUp: (q) => handleFollowUp(q, nodeId),
            onAddAround: (q) => handleAddAround(q, nodeId),
            onDelete: () => {
              setNodes((nds) => nds.filter((n) => n.id !== nodeId));
              setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            },
            onExpand: () => {
              setSelectedNode({ id: nodeId, data: { question: node.question, response: transformedResponse } });
              setShowNodeDetails(true);
            },
            onCopy: () => {
              navigator.clipboard.writeText(JSON.stringify({ question: node.question }, null, 2));
            },
          },
        };
        
        setNodes((nds) => [...nds, newNode]);
        
        // Create edge
        setEdges((eds) => [
          ...eds,
          {
            id: `e-${parentInfo.id}-${nodeId}`,
            source: parentInfo.id,
            sourceHandle: 'bottom',
            target: nodeId,
            targetHandle: 'top',
            animated: true,
            style: { stroke: "#2563eb", strokeWidth: 2 },
          },
        ]);
      });
      
    } catch (error) {
      console.error('Failed to load thread:', error);
      setError('Failed to load thread. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  }, [setNodes, setEdges]);

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

  // Handle adding a new node from the plus button
  const handleAddAround = useCallback(async (question, parentNodeId) => {
    console.log('handleAddAround called with:', { question, parentNodeId });
    
    // Find the parent node
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) {
      console.error('Parent node not found:', parentNodeId);
      return;
    }

    // Get the actual API node ID from the parent node's data
    const parentApiNodeId = parentNode.data.response?.nodeId;
    if (!parentApiNodeId) {
      console.error('Parent API node ID not found in node data');
      return;
    }

    console.log('Using parent API node ID for plus button:', parentApiNodeId);

    const id = `query-${++nodeCounter.current}`;
    
    // Find existing children count for positioning
    const existingChildren = nodes.filter(n => 
      edges.some(e => e.source === parentNodeId && e.target === n.id)
    ).length;
    
    const position = calculateTreePosition(parentNode, existingChildren);

    const newNode = {
      id,
      type: "queryNode",
      position,
      data: {
        question,
        response: null,
        isLoading: true,
        onFollowUp: (q) => handleFollowUp(q, id),
        onAddAround: (q) => handleAddAround(q, id),
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

    // Add the new node
    setNodes((nds) => [...nds, newNode]);

    // Create edge from parent to child
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

    // Check if we have thread_id
    if (!apiThreadId) {
      console.error('No thread ID available');
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  response: { 
                    summary: 'Error: No active thread. Please start a new conversation.' 
                  }, 
                  isLoading: false 
                } 
              }
            : n
        )
      );
      return;
    }

    // Call the query API for the new node
    setIsExecuting(true);
    setError(null);
    
    try {
      console.log('Calling sendQuery API with:', { question, apiThreadId });
      const apiResponse = await sendQuery(question, apiThreadId);
      console.log('API Response:', apiResponse);
      
      const nodeResponse = transformResponse(apiResponse);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, response: nodeResponse, isLoading: false } }
            : n
        )
      );

    } catch (error) {
      console.error('Failed to get response:', error);
      setError(error.message || 'Failed to fetch data from API');
      
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  response: { 
                    summary: `Error: ${error.message || 'Failed to connect to API'}. Please try again.` 
                  }, 
                  isLoading: false 
                } 
              }
            : n
        )
      );
    } finally {
      setIsExecuting(false);
    }
  }, [setNodes, setEdges, nodes, edges, apiThreadId]);

  // Handle follow-up questions (from the related questions list)
  const handleFollowUp = useCallback(async (question, parentNodeId) => {
    console.log('handleFollowUp called with:', { question, parentNodeId, apiThreadId });
    
    // Find the parent node
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) {
      console.error('Parent node not found:', parentNodeId);
      console.log('Available nodes:', nodes.map(n => ({ id: n.id, apiNodeId: n.data.response?.nodeId })));
      return;
    }

    // Get the actual API node ID from the parent node's data
    const parentApiNodeId = parentNode.data.response?.nodeId;
    if (!parentApiNodeId) {
      console.error('Parent API node ID not found in node data');
      console.log('Parent node data:', parentNode.data);
      return;
    }

    console.log('Using parent API node ID for follow-up:', parentApiNodeId);

    const id = `query-${++nodeCounter.current}`;
    
    // Find existing children count for positioning
    const existingChildren = nodes.filter(n => 
      edges.some(e => e.source === parentNodeId && e.target === n.id)
    ).length;
    
    const position = calculateTreePosition(parentNode, existingChildren);

    const newNode = {
      id,
      type: "queryNode",
      position,
      data: {
        question,
        response: null,
        isLoading: true,
        onFollowUp: (q) => handleFollowUp(q, id),
        onAddAround: (q) => handleAddAround(q, id),
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

    // Add the new node
    setNodes((nds) => [...nds, newNode]);

    // Create edge from parent to child
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

    // Check if we have thread_id
    if (!apiThreadId) {
      console.error('No thread ID available for follow-up');
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  response: { 
                    summary: 'Error: No active thread. Please start a new conversation.' 
                  }, 
                  isLoading: false 
                } 
              }
            : n
        )
      );
      return;
    }

    // Call the follow-up API with the CORRECT parent_node_id (API node ID)
    setIsExecuting(true);
    setError(null);
    
    try {
      console.log('Calling follow-up API with:', { 
        question, 
        apiThreadId, 
        parent_node_id: parentApiNodeId  // Using the API node ID, not the React Flow ID
      });
      
      const apiResponse = await sendFollowUp(question, apiThreadId, parentApiNodeId);
      console.log('Follow-up API response:', apiResponse);
      
      const nodeResponse = transformResponse(apiResponse);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, response: nodeResponse, isLoading: false } }
            : n
        )
      );

    } catch (error) {
      console.error('Failed to get follow-up response:', error);
      setError(error.message || 'Failed to fetch follow-up data');
      
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  response: { 
                    summary: `Error: ${error.message || 'Failed to connect to API'}. Please try again.` 
                  }, 
                  isLoading: false 
                } 
              }
            : n
        )
      );
    } finally {
      setIsExecuting(false);
    }
  }, [setNodes, setEdges, nodes, edges, apiThreadId]);

  // Main function to add a root query node
  const addQueryNode = useCallback(async (question, parentNodeId = null) => {
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
        onFollowUp: (q) => handleFollowUp(q, id),
        onAddAround: (q) => handleAddAround(q, id),
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

    // Call the main query API
    setIsExecuting(true);
    setError(null);
    
    try {
      const apiResponse = await sendQuery(question, apiThreadId);
      console.log('Query API response:', apiResponse);
      
      // Store the thread_id for next API call
      if (apiResponse.thread_id) {
        setApiThreadId(apiResponse.thread_id);
        setActiveThread(apiResponse.thread_id);
        // Refresh threads list
        loadThreads();
      }
      
      const nodeResponse = transformResponse(apiResponse);
      
      // Log to verify nodeId is present
      console.log('Node response with nodeId:', nodeResponse);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, response: nodeResponse, isLoading: false } }
            : n
        )
      );

    } catch (error) {
      console.error('Failed to get response:', error);
      setError(error.message || 'Failed to fetch data from API');
      
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  response: { 
                    summary: `Error: ${error.message || 'Failed to connect to API'}. Please try again.` 
                  }, 
                  isLoading: false 
                } 
              }
            : n
        )
      );
    } finally {
      setIsExecuting(false);
    }
  }, [setNodes, setEdges, nodes, edges, apiThreadId, handleFollowUp, handleAddAround]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    await addQueryNode(inputValue.trim());
    setInputValue("");
  };

  const handleNewThread = () => {
    setApiThreadId(null);
    setActiveThread(null);
    setNodes([]);
    setEdges([]);
    nodeCounter.current = 0;
    setError(null);
  };

  const handleSelectThread = async (threadId) => {
    await loadThread(threadId);
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteThread(threadId);
      await loadThreads();
      if (activeThread === threadId) {
        handleNewThread();
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
      setError('Failed to delete thread');
    }
  };

  const suggestedQueries = [
    "What's my total ASNs last 30 days?",
    "What are the status of my various ASNs?",
    "Show me inventory by category",
    "Total revenue this month",
    "Pending putaway tasks",
  ];

  return (
    <div className="flex w-screen h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <Sidebar
        threads={threads}
        activeThread={activeThread}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
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
                {activeThread ? `Thread: ${activeThread.slice(0, 8)}...` : "New Thread"}
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
                disabled={!inputValue.trim() || isExecuting}
                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                  inputValue.trim() && !isExecuting
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
              <Zap size={10} className="text-yellow-600" /> Connected to AI API • {apiThreadId ? 'Thread active' : 'New conversation'}
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