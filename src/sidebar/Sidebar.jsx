import React, { useState } from 'react';
import {
  Warehouse,
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Clock,
  BarChart3,
  Package,
  TrendingUp,
  Users,
  Calendar,
  Star,
} from 'lucide-react';

export default function Sidebar({
  threads,
  activeThread,
  onSelectThread,
  onNewThread,
  user,
  onLogout,
  onToggleSidebar,
  collapsed
}) {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (threadId, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  return (
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      collapsed ? 'w-[70px]' : 'w-[260px]'
    }`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 ${
        collapsed ? 'justify-center' : ''
      }`}>
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Warehouse size={collapsed ? 20 : 24} className="text-blue-600" />
        </div>
        {!collapsed && (
          <div className="flex-1">
            <div className="text-base font-bold text-gray-800">WMS AI</div>
            <div className="text-[10px] text-gray-500">Intelligent Warehouse</div>
          </div>
        )}
        <button 
          onClick={onToggleSidebar}
          className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded text-gray-400 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* User Info */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-200 ${
        collapsed ? 'justify-center' : ''
      }`}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Admin User'}</div>
              <div className="text-[10px] text-gray-500">Warehouse Manager</div>
            </div>
            <button onClick={onLogout} className="text-gray-400 hover:text-gray-600">
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>

      {/* New Thread Button */}
      <button
        onClick={onNewThread}
        className={`mx-4 my-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
          collapsed ? 'p-3' : 'p-2.5'
        }`}
      >
        <Plus size={16} />
        {!collapsed && <span className="text-sm font-medium">New Query</span>}
      </button>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase mb-2">Quick Actions</div>
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
      )}

      {/* Thread List */}
      <div className="flex-1 overflow-auto px-3 py-2">
        {!collapsed && (
          <div className="flex items-center px-2 py-2 text-xs font-medium text-gray-500">
            <MessageSquare size={12} className="mr-2" />
            <span>Recent Threads</span>
          </div>
        )}
        
        {threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg mb-1 transition ${
              activeThread === thread.id 
                ? 'bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <MessageSquare size={12} className="text-gray-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-gray-800 truncate">
                  {thread.title}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                  <Clock size={8} />
                  <span>{thread.time}</span>
                  <span>•</span>
                  <span>{thread.nodeCount} nodes</span>
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={(e) => toggleFavorite(thread.id, e)}
                className="text-gray-300 hover:text-yellow-400"
              >
                <Star size={10} className={favorites.includes(thread.id) ? 'fill-yellow-400 text-yellow-400' : ''} />
              </button>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className={`border-t border-gray-200 p-3 ${collapsed ? 'text-center' : ''}`}>
        <button className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 text-gray-600 ${
          collapsed ? 'justify-center' : ''
        }`}>
          <Settings size={16} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </button>
        <button className={`flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 text-gray-600 ${
          collapsed ? 'justify-center' : ''
        }`}>
          <HelpCircle size={16} />
          {!collapsed && <span className="text-sm">Help</span>}
        </button>
      </div>
    </div>
  );
}