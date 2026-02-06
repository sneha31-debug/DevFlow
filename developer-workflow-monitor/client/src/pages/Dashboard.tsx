import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Activity, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
    id: string;
    username: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    authProvider?: string;
}

const Dashboard = () => {
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    }, []);

    const containerVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariant = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="page-container max-w-7xl mx-auto p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back{user ? `, ${user.displayName || user.username}` : ''}
                    </h1>
                    <p className="text-slate-400">Here's what's happening with your projects today.</p>
                </div>
                <Link
                    to="/projects/new"
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-purple-900/20"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </header>

            <motion.div
                variants={containerVariant}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
                {/* Stats Cards */}
                <motion.div variants={itemVariant} className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Total Monitors</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white">12</p>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                100% Operational
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariant} className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Avg Response</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white">45<span className="text-lg text-slate-500 ml-1">ms</span></p>
                            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                                ↓ 12%
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariant} className="glass-panel p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Error Rate</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold text-white">0.01%</p>
                            <span className="text-xs text-slate-500">Last 24h</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Recent Activity Stub */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-2xl p-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    <Link to="/logs" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</Link>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${i === 1 ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`} />
                                <div>
                                    <p className="font-medium text-slate-200 group-hover:text-white transition-colors">GET /api/users</p>
                                    <p className="text-xs text-slate-500">Project: E-commerce Core</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono text-slate-500">2 mins ago</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
