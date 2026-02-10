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

        <div className="flex h-screen bg-[#020204] text-white overflow-hidden font-sans selection:bg-violet-500/30">
            {/* Background Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#050507] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-white/10">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-bold text-xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">DevFlow</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto md:hidden text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Platform</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${isActive || (item.path !== '/' && location.pathname.startsWith(item.path))
                                    ? 'text-white bg-white/[0.08] shadow-sm ring-1 ring-white/5'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-white'} `} />
                                    {item.label}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User / Footer */}
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#050507] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="text-zinc-400 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="font-semibold text-white">DevFlow</span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-auto relative scroll-smooth bg-[#020204]">
                    <div className="relative z-10 min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
