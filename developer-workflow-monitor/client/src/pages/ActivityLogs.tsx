import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, RefreshCw, Filter, Github, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface ActivityLog {
    _id: string;
    action: string;
    message: string;
    repository?: {
        name: string;
        fullName: string;
    };
    metadata?: Record<string, any>;
    timestamp: string;
}

const ActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/api/github/logs`;
            if (filter) url += `?action=${filter}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            REPO_SYNC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            LOGIN: 'bg-green-500/20 text-green-400 border-green-500/30',
            LOGOUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            API_CALL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        return colors[action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen p-8 relative">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black -z-10" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <FileText className="w-8 h-8" />
                                Activity Logs
                            </h1>
                            <p className="text-text-muted mt-1">
                                Track all your GitHub activity
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="glass-panel p-4 rounded-xl mb-6 flex items-center gap-4">
                    <Filter className="w-5 h-5 text-text-muted" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent border-none text-white focus:outline-none cursor-pointer"
                    >
                        <option value="" className="bg-slate-800">All Actions</option>
                        <option value="REPO_SYNC" className="bg-slate-800">Repository Sync</option>
                        <option value="LOGIN" className="bg-slate-800">Login</option>
                        <option value="API_CALL" className="bg-slate-800">API Calls</option>
                    </select>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-text-muted">
                        Loading activity logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <h3 className="text-xl font-medium mb-2">No activity logs yet</h3>
                        <p className="text-text-muted">
                            Sync your repositories to start tracking activity
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <motion.div
                                key={log._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-4 rounded-xl"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            {log.repository && (
                                                <div className="flex items-center gap-1 text-sm text-text-muted">
                                                    <Github className="w-4 h-4" />
                                                    {log.repository.name}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-white">{log.message}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-text-muted">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(log.timestamp)}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
