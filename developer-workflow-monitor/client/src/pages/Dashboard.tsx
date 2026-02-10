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

        <div className="page-container max-w-7xl mx-auto p-8 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        Welcome back<span className="text-zinc-500">,</span> {user?.displayName || user?.username || 'user'}
                    </h1>
                    <p className="text-zinc-400 text-lg">Here's what's happening with your projects today.</p>
                </div>
                <Link
                    to="/projects/new"
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-500/20 px-6 py-4 rounded-xl text-base"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </header>

            <motion.div
                variants={containerVariant}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
                {/* Stats Cards */}
                <motion.div variants={itemVariant} className="bg-[#09090b] border border-white/5 rounded-[24px] p-8 relative overflow-hidden group hover:border-violet-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-violet-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">Total Monitors</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-5xl font-bold text-white tracking-tight">12</p>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                                100% Operational
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariant} className="bg-[#09090b] border border-white/5 rounded-[24px] p-8 relative overflow-hidden group hover:border-blue-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-32 h-32 text-blue-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">Avg Response</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-5xl font-bold text-white tracking-tight">45<span className="text-xl text-zinc-500 ml-1">ms</span></p>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 flex items-center gap-1">
                                ↓ 12%
                            </span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariant} className="bg-[#09090b] border border-white/5 rounded-[24px] p-8 relative overflow-hidden group hover:border-red-500/20 transition-colors duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle className="w-32 h-32 text-red-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">Error Rate</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-5xl font-bold text-white tracking-tight">0.01%</p>
                            <span className="text-xs font-bold text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                Last 24h
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Recent Activity Stub */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#09090b] border border-white/5 rounded-[24px] p-8 md:p-10"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                    <Link to="/logs" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors">View All Activities</Link>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-[#0F1117] hover:bg-[#13161C] rounded-2xl border border-white/5 transition-all group hover:border-white/10">
                            <div className="flex items-center gap-5">
                                <div className={`w-3 h-3 rounded-full shadow-[0_0_12px] ${i === 1 ? 'bg-red-500 shadow-red-500/40' : 'bg-emerald-500 shadow-emerald-500/40'}`} />
                                <div>
                                    <p className="font-semibold text-white group-hover:text-violet-200 transition-colors text-lg mb-1">GET /api/users</p>
                                    <p className="text-sm text-zinc-500">Project: <span className="text-zinc-400">E-commerce Core</span></p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-zinc-500">2 mins ago</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
