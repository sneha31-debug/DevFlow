import { Link } from 'react-router-dom';
import { Plus, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectList = () => {
    return (
        <div className="min-h-screen pl-64">
            {/* Re-use Sidebar logic or make a Layout component later for cleanliness, but copying for specific file isolation is fine for initial setup */}
            <div className="w-64 glass-panel border-r border-[#ffffff10] h-screen flex flex-col fixed left-0 top-0 z-20">
                <div className="p-6 border-b border-[#ffffff10]">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        DevMonitor
                    </h1>
                </div>
                {/* Simplified nav for stub */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">Back to Dashboard</Link>
                </nav>
            </div>

            <main className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Projects</h1>
                        <p className="text-text-muted">Manage your monitored services</p>
                    </div>
                    <Link to="/projects/new" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Project
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Fake Project Cards */}
                    {[1, 2, 3].map((i) => (
                        <motion.div key={i} whileHover={{ y: -5 }} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Github className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Service-Core-API-{i}</h3>
                            <p className="text-text-muted text-sm mb-4">Node.js • Express • MongoDB</p>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="px-2 py-1 bg-success/10 text-success rounded">99.9% Uptime</div>
                                <div className="text-text-muted">Last check: 2m ago</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ProjectList;
