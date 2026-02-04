import { Github, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProjectForm = () => {
    return (
        <div className="min-h-screen pl-64">
            <div className="w-64 glass-panel border-r border-[#ffffff10] h-screen flex flex-col fixed left-0 top-0 z-20">
                <div className="p-6 border-b border-[#ffffff10]">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        DevMonitor
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">Back to Dashboard</Link>
                </nav>
            </div>

            <main className="p-8 max-w-4xl mx-auto align-middle justify-center flex flex-col h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 rounded-2xl"
                >
                    <h1 className="text-3xl font-bold mb-6">Import New Project</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <button className="border border-dashed border-[#ffffff20] hover:border-primary hover:bg-primary/5 p-8 rounded-xl flex flex-col items-center gap-4 transition-all group">
                            <div className="w-16 h-16 bg-[#ffffff05] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Github className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold mb-1">Import from GitHub</h3>
                                <p className="text-sm text-text-muted">Connect your repository to auto-detect APIs</p>
                            </div>
                        </button>

                        <button className="border border-dashed border-[#ffffff20] hover:border-accent hover:bg-accent/5 p-8 rounded-xl flex flex-col items-center gap-4 transition-all group">
                            <div className="w-16 h-16 bg-[#ffffff05] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Globe className="w-8 h-8 text-text-muted group-hover:text-accent transition-colors" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold mb-1">Manual Configuration</h3>
                                <p className="text-sm text-text-muted">Enter API endpoints manually</p>
                            </div>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#ffffff10]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#172033] text-text-muted">Recent Repositories</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        {/* Mock Repos */}
                        <div className="p-4 rounded-lg bg-white/5 flex justify-between items-center hover:bg-white/10 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5" />
                                <span>user/ecommerce-api</span>
                            </div>
                            <button className="btn-primary text-xs py-1 px-3">Connect</button>
                        </div>
                        <div className="p-4 rounded-lg bg-white/5 flex justify-between items-center hover:bg-white/10 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Github className="w-5 h-5" />
                                <span>user/auth-service</span>
                            </div>
                            <button className="btn-primary text-xs py-1 px-3">Connect</button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ProjectForm;
