import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FolderKanban, GitBranch,
    Activity, FileText, TestTube, LogOut,
    Menu, X
} from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/projects', label: 'Projects', icon: FolderKanban },
        { path: '/repositories', label: 'Repositories', icon: GitBranch },
        { path: '/monitors', label: 'Uptime', icon: Activity },
        { path: '/tests', label: 'API Tester', icon: TestTube },
        { path: '/logs', label: 'Activity Logs', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-100 bg-[#0F1117] text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset - y - 0 left - 0 z - 50 w - 64 bg - [#13161C] border - r border - white / 5 flex flex - col transition - transform duration - 300 ease -in -out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[#13161C]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-lg tracking-tight text-white">DevFlow</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto md:hidden text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Platform</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items - center gap - 3 px - 3 py - 2.5 rounded - lg text - sm font - medium transition - all duration - 200 group relative
                                ${isActive || (item.path !== '/' && location.pathname.startsWith(item.path))
                                    ? 'text-white bg-white/5 shadow-inner'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }
`}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w - 5 h - 5 transition - colors ${isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'} `} />
                                    {item.label}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500/50 rounded-r-full blur-[2px]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-white/5 bg-[#0F1117]/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b border-white/5 flex items-center px-4 bg-[#13161C] flex-shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-semibold text-white">DevFlow</span>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-auto relative scroll-smooth">
                    {/* Gradient Blob for atmosphere */}
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 via-blue-900/5 to-transparent pointer-events-none opacity-50" />

                    <div className="relative z-10 min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
