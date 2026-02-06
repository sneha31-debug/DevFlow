import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, X, Globe } from 'lucide-react';

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

    const checkNow = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
        <div className="page-container max-w-7xl mx-auto p-8">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-purple-500" />
                        Uptime Monitors
                    </h1>
                    <p className="text-slate-400">Real-time health checks for your deployments</p>
                </div>
                <button
                    onClick={() => setAdding(!adding)}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-purple-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Monitor
                </button>
            </header>

            <AnimatePresence>
                {adding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <form
                            onSubmit={handleAddMonitor}
                            className="glass-panel p-6 rounded-xl border border-purple-500/30 bg-purple-900/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">New Monitor</h3>
                                <button type="button" onClick={() => setAdding(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. Production API"
                                        className="input-field bg-black/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        placeholder="https://api.example.com/health"
                                        className="input-field bg-black/40"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdding(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Monitor
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
            ) : monitors.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl border-dashed">
                    <Activity className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No monitors yet</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">Add a URL to start tracking uptime and response latency.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monitors.map((monitor) => (
                        <motion.div
                            key={monitor._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-6 rounded-xl hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${monitor.status === 'up' ? 'bg-emerald-500/10 text-emerald-500' :
                                            monitor.status === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {monitor.status === 'up' ? <CheckCircle className="w-4 h-4" /> :
                                                monitor.status === 'down' ? <AlertCircle className="w-4 h-4" /> :
                                                    <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                                        </div>
                                        <h3 className="font-bold text-lg text-white tracking-tight">{monitor.name}</h3>
                                    </div>
                                    <a
                                        href={monitor.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-mono text-slate-500 hover:text-purple-400 flex items-center gap-1.5 ml-9 transition-colors"
                                    >
                                        <Globe className="w-3 h-3" />
                                        {monitor.url}
                                    </a>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => checkNow(monitor._id, e)}
                                        disabled={refreshing === monitor._id}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                        title="Check Now"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${refreshing === monitor._id ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => deleteMonitor(monitor._id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Status</div>
                                    <div className={`font-bold ${monitor.status === 'up' ? 'text-emerald-400' : 'text-red-400'} uppercase text-sm`}>
                                        {monitor.status}
                                    </div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Latency</div>
                                    <div className="font-bold text-white text-sm">{monitor.responseTime || '-'}ms</div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Last Checked</div>
                                    <div className="text-sm text-slate-300 truncate">
                                        {monitor.lastChecked ? new Date(monitor.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="h-24 w-full opacity-60 hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monitor.history}>
                                        <defs>
                                            <linearGradient id={`colorLatency-${monitor._id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                            labelStyle={{ display: 'none' }}
                                            formatter={(value) => [`${value}ms`, 'Latency']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="responseTime"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill={`url(#colorLatency-${monitor._id})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Monitors;
