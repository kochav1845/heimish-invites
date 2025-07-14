import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  X, 
  RefreshCw, 
  Download, 
  Filter, 
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  MessageSquare,
  Mail,
  Phone,
  Brain,
  Calendar,
  User,
  Globe } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LogEntry {
  id: string;
  service: 'resend' | 'twilio' | 'supabase';
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  user_email?: string;
  endpoint?: string;
  duration?: number;
  cost?: number;
}

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());


  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-service-logs?limit=100`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setFilteredLogs(data.logs || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Filter logs based on selected filters and search term
    let filtered = logs;

    if (selectedService !== 'all') {
      filtered = filtered.filter(log => log.service === selectedService);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedService, selectedLevel, searchTerm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLogs();
      }, 10000); // Refresh every 10 seconds for real-time feel
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadLogs]);

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'twilio': return <Phone size={16} className="text-red-400" />;
      case 'resend': return <Mail size={16} className="text-blue-400" />;
      case 'supabase': return <Database size={16} className="text-purple-400" />;
      default: return <Globe size={16} className="text-gray-400" />;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
      case 'info': return <Clock size={16} className="text-blue-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-400 bg-green-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'info': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `stardev-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const refreshLogs = () => {
    loadLogs();
  };

  const getServiceStats = () => {
    const stats = {
      twilio: { count: 0, errors: 0, totalCost: 0 },
      resend: { count: 0, errors: 0, totalCost: 0 },
      supabase: { count: 0, errors: 0, totalCost: 0 }
    };

    logs.forEach(log => {
      stats[log.service].count++;
      if (log.level === 'error') stats[log.service].errors++;
      if (log.cost) stats[log.service].totalCost += log.cost;
    });

    return stats;
  };

  const stats = getServiceStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">System logs and monitoring</p>
              <p className="text-gray-500 text-sm mt-1">Last updated: {lastRefresh.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Real-time Status */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-400">
                {autoRefresh ? 'Live updates enabled' : 'Manual refresh only'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Fetching real-time data from Resend, Twilio, and Supabase APIs
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(stats).map(([service, data]) => (
              <div key={service} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service)}
                    <span className="text-white font-medium capitalize">{service}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{data.count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">{data.errors} errors</span>
                  {data.totalCost > 0 && (
                    <span className="text-green-400">${data.totalCost.toFixed(4)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 border-b border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Services</option>
              <option value="twilio">Twilio</option>
              <option value="resend">Resend</option>
              <option value="supabase">Supabase</option>
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            {/* Auto Refresh */}
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-purple-600"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={refreshLogs}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportLogs}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white">Loading logs...</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <caption className="sr-only">
                      Real-time service logs from Resend, Twilio, and Supabase. 
                      Showing {filteredLogs.length} of {logs.length} total log entries.
                      Last updated: {lastRefresh.toLocaleString()}
                    </caption>
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-medium">Time</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Service</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Level</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Message</th>
                        <th className="px-4 py-3 text-left text-white font-medium">User</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Duration</th>
                        <th className="px-4 py-3 text-left text-white font-medium">Cost</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {filteredLogs.map((log, index) => (
                        <tr key={log.id} className={`border-t border-gray-700 ${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'}`}>
                          <td className="px-4 py-3 text-gray-300 text-sm">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getServiceIcon(log.service)}
                              <span className="text-white capitalize">{log.service}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                              {getLevelIcon(log.level)}
                              <span className="capitalize">{log.level}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300 max-w-md">
                            <div className="truncate" title={log.message}>
                              {log.message}
                            </div>
                            {log.details && (
                              <div className="text-xs text-gray-500 mt-1">
                                {JSON.stringify(log.details).substring(0, 100)}...
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm">
                            {log.user_email && (
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                <span className="truncate max-w-32" title={log.user_email}>
                                  {log.user_email}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm">
                            {log.duration && `${log.duration}ms`}
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-sm">
                            {log.cost && (
                              <span className="text-green-400">${log.cost.toFixed(4)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No logs found. Try adjusting your filters or check back in a moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;