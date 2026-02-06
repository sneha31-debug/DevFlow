import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Plus, Trash2, ArrowLeft, Globe, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface Monitor {
    _id: string;
    name: string;
    url: string;
    status: 'up' | 'down' | 'pending';
    frequency: number;
    responseTime: number;
    lastChecked: string;
    history: {
        timestamp: string;
        status: 'up' | 'down';
        responseTime: number;
    }[];
}

const Monitors = () => {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [refreshing, setRefreshing] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Form state
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const fetchMonitors = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/monitors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.monitors) {
                setMonitors(data.monitors);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleAddMonitor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/monitors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName, url: newUrl }),
            });
            const data = await res.json();
            if (res.ok) {
                setMonitors(prev => [data.monitor, ...prev]);
                setAdding(false);
                setNewName('');
                setNewUrl('');
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteMonitor = async (id: string) => {
        if (!confirm('Delete this monitor?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/monitors/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setMonitors(prev => prev.filter(m => m._id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const checkNow = async (id: string) => {
        setRefreshing(id);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/monitors/${id}/check`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            // Give it a moment to update DB then fetch
            setTimeout(fetchMonitors, 1000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTimeout(() => setRefreshing(null), 1000);
        }
    };

    return (
        <div className="min-h-screen p-8 relative">
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black -z-10" />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Activity className="w-8 h-8" />
                                Uptime Monitors
                            </h1>
                            <p className="text-text-muted mt-1">
                                Real-time health checks for your deployments
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setAdding(!adding)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Monitor
                    </button>
                </div>

                {adding && (
                    <motion.form
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleAddMonitor}
                        className="glass-panel p-6 rounded-xl mb-8"
                    >
                        <h3 className="text-xl font-semibold mb-4">Add New Monitor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Production API"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="https://api.example.com"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setAdding(false)}
                                className="px-4 py-2 text-text-muted hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Create Monitor
                            </button>
                        </div>
                    </motion.form>
                )}

                {loading ? (
                    <div className="text-center py-12 text-text-muted">Loading monitors...</div>
                ) : monitors.length === 0 ? (
                    <div className="text-center py-12">
                        <Activity className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <h3 className="text-xl font-medium mb-2">No monitors yet</h3>
                        <p className="text-text-muted">Add a URL to start tracking uptime</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {monitors.map((monitor) => (
                            <motion.div
                                key={monitor._id}
                                layout
                                className="glass-panel p-6 rounded-xl"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            {monitor.status === 'up' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : monitor.status === 'down' ? (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
                                            )}
                                            <h3 className="font-semibold text-lg">{monitor.name}</h3>
                                        </div>
                                        <a
                                            href={monitor.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-text-muted hover:text-primary flex items-center gap-1 mt-1"
                                        >
                                            <Globe className="w-3 h-3" />
                                            {monitor.url}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => checkNow(monitor._id)}
                                            disabled={refreshing === monitor._id}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Check Now"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${refreshing === monitor._id ? 'animate-spin' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => deleteMonitor(monitor._id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-white/5 p-3 rounded-lg text-center">
                                        <div className="text-xs text-text-muted mb-1">Status</div>
                                        <div className={`font-semibold ${monitor.status === 'up' ? 'text-green-400' : 'text-red-400'} uppercase`}>
                                            {monitor.status}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg text-center">
                                        <div className="text-xs text-text-muted mb-1">Response Time</div>
                                        <div className="font-semibold">{monitor.responseTime || '-'}ms</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg text-center">
                                        <div className="text-xs text-text-muted mb-1">Last Checked</div>
                                        <div className="text-sm">
                                            {monitor.lastChecked ? new Date(monitor.lastChecked).toLocaleTimeString() : '-'}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-32 mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monitor.history}>
                                            <defs>
                                                <linearGradient id={`colorLatency-${monitor._id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ display: 'none' }}
                                                formatter={(value) => [`${value}ms`, 'Latency']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="responseTime"
                                                stroke="#4f46e5"
                                                fillOpacity={1}
                                                fill={`url(#colorLatency-${monitor._id})`}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Monitors;
