// src/sidebar/Sidebar.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Warehouse,
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  BarChart3,
  Package,
  TrendingUp,
  Calendar,
  Star,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getThreads, deleteThread } from "../services/api";

export default function Sidebar({ onToggleSidebar, collapsed }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeThread = searchParams.get("thread");

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = await getThreads(20);
      setThreads(data?.threads || []);
    } catch (error) {
      console.error("Failed to load threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (threadId) => {
    setSearchParams({ thread: threadId });
    navigate(`/flow?thread=${threadId}`);
  };

  const handleNewThread = () => {
    navigate("/flow");
  };

  const handleDeleteThread = async (threadId, e) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this thread?",
    );
    if (!confirmed) return;

    setDeletingId(threadId);

    try {
      await deleteThread(threadId);

      setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
      setFavorites((prev) => prev.filter((id) => id !== threadId));

      if (activeThread === threadId) {
        navigate("/flow");
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Failed to delete thread. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleFavorite = (threadId, e) => {
    e.stopPropagation();

    setFavorites((prev) =>
      prev.includes(threadId)
        ? prev.filter((id) => id !== threadId)
        : [...prev, threadId],
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const filteredThreads = useMemo(() => {
    if (!showFavorites) return threads;
    return threads.filter((t) => favorites.includes(t.thread_id));
  }, [threads, showFavorites, favorites]);

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[360px]"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Warehouse size={collapsed ? 20 : 24} className="text-blue-600" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-gray-800">WMS AI</div>
            <div className="text-[10px] text-gray-500">
              Intelligent Warehouse
            </div>
          </div>
        )}

        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-gray-200 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {"U"}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {"Admin User"}
              </div>
              <div className="text-[10px] text-gray-500">Warehouse Manager</div>
            </div>

            <button
              onClick={() => {
                sessionStorage.removeItem("auth_token");
                sessionStorage.removeItem("user");
                navigate("/login");
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>

      {/* New Query */}
      <div className="px-4 py-3">
        <button
          onClick={handleNewThread}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition h-10 w-full"
        >
          <Plus size={16} />
          {!collapsed && <span className="text-sm font-medium">New Query</span>}
        </button>
      </div>

      {/* Quick Actions */}
      {/* {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-500 uppercase">
              Quick Actions
            </div>
            <button
              onClick={loadThreads}
              className="text-gray-400 hover:text-blue-600"
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
              <Package size={14} className="text-gray-600" />
              <span className="text-xs">Inventory</span>
            </button>

            <button className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
              <BarChart3 size={14} className="text-gray-600" />
              <span className="text-xs">Analytics</span>
            </button>

            <button className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
              <TrendingUp size={14} className="text-gray-600" />
              <span className="text-xs">Reports</span>
            </button>

            <button className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
              <Calendar size={14} className="text-gray-600" />
              <span className="text-xs">Schedule</span>
            </button>
          </div>
        </div>
      )} */}

      {/* Thread List */}
      <div className="flex-1 overflow-auto px-3 py-2">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-gray-500">
            <MessageSquare size={12} />
            <span className="flex-1">Recent Threads</span>
            <button
              onClick={() => setShowFavorites((prev) => !prev)}
              className={`hover:text-yellow-400 ${
                showFavorites ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              <Star
                size={12}
                className={showFavorites ? "fill-yellow-400" : ""}
              />
            </button>
          </div>
        )}

        {loading && !collapsed ? (
          <div className="flex justify-center py-4">
            <RefreshCw size={16} className="animate-spin text-blue-600" />
          </div>
        ) : filteredThreads.length === 0 && !collapsed ? (
          <div className="text-center py-4 text-xs text-gray-500">
            No threads found
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div
              key={thread.thread_id}
              onClick={() => handleSelectThread(thread.thread_id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg mb-1 transition group cursor-pointer ${
                activeThread === thread.thread_id
                  ? "bg-blue-50 border border-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <MessageSquare size={12} className="text-gray-600" />
              </div>

              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {thread.title || "Untitled Thread"}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <Clock size={8} />
                      <span>{formatDate(thread.updated_at)}</span>
                      <span>•</span>
                      <span>
                        {thread.node_count || 0} node
                        {(thread.node_count || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => toggleFavorite(thread.thread_id, e)}
                      className="text-gray-300 hover:text-yellow-400"
                    >
                      <Star
                        size={10}
                        className={
                          favorites.includes(thread.thread_id)
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                        }
                      />
                    </button>

                    <button
                      onClick={(e) => handleDeleteThread(thread.thread_id, e)}
                      className="text-gray-300 hover:text-red-500"
                      disabled={deletingId === thread.thread_id}
                    >
                      {deletingId === thread.thread_id ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <Trash2 size={10} />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom */}
      <div
        className={`border-t border-gray-200 p-3 ${
          collapsed ? "text-center" : ""
        }`}
      >
        {/* <button
          className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 text-gray-600 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Settings size={16} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </button> */}

        <button
          className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 text-gray-600 ${
            collapsed ? "justify-center" : ""
          }`}
          onClick={() => {
            sessionStorage.removeItem("auth_token");
            sessionStorage.removeItem("user");
            navigate("/login");
          }}
        >
          <LogOut size={16} />
          {!collapsed && (
            <span className="text-sm hover:text-red-500">Logout</span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
