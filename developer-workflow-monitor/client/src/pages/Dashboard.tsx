import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, FileText, Plus, LogOut, User, Github } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
    id: string;
    username: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
    authProvider?: string;
}

const Sidebar = ({ user, onLogout }: { user: UserProfile | null; onLogout: () => void }) => {
    return (
        <div className="w-64 glass-panel border-r border-[#ffffff10] h-screen flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6 border-b border-[#ffffff10]">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    DevMonitor
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link to="/repositories" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Github className="w-5 h-5" />
                    Repositories
                </Link>
                <Link to="/projects" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Activity className="w-5 h-5" />
                    Projects
                </Link>
                <Link to="/logs" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <FileText className="w-5 h-5" />
                    Activity Logs
                </Link>
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-[#ffffff10]">
                {user && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="font-medium text-sm truncate">{user.displayName || user.username}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-error w-full rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen pl-64">
            <Sidebar user={user} onLogout={handleLogout} />

            <main className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            Welcome{user ? `, ${user.displayName || user.username}` : ''}!
                        </h1>
                        <p className="text-text-muted">Overview of your API performance</p>
                    </div>
                    <Link to="/projects/new" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Project
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stats Cards */}
                    <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl">
                        <h3 className="text-text-muted text-sm font-medium mb-2">Total Monitors</h3>
                        <p className="text-3xl font-bold">12</p>
                        <div className="mt-4 text-xs text-success flex items-center gap-1">
                            <span>●</span> All systems operational
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl">
                        <h3 className="text-text-muted text-sm font-medium mb-2">Avg Response Time</h3>
                        <p className="text-3xl font-bold">45ms</p>
                        <div className="mt-4 text-xs text-success flex items-center gap-1">
                            <span>↓</span> 12% vs last week
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl">
                        <h3 className="text-text-muted text-sm font-medium mb-2">Error Rate</h3>
                        <p className="text-3xl font-bold">0.01%</p>
                        <div className="mt-4 text-xs text-text-muted">
                            Last 24 hours
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity Stub */}
                <div className="glass-panel rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-error' : 'bg-success'}`} />
                                    <div>
                                        <p className="font-medium">GET /api/users</p>
                                        <p className="text-xs text-text-muted">Project: E-commerce Core</p>
                                    </div>
                                </div>
                                <span className="text-sm text-text-muted">2 mins ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
