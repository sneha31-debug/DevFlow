import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderGit2, Trash2, ExternalLink, Clock, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface Repository {
    _id: string;
    name: string;
    fullName: string;
    url: string;
    language?: string;
    stars: number;
    forks: number;
    isPrivate: boolean;
}

interface Project {
    _id: string;
    name: string;
    description?: string;
    repository: Repository;
    status: 'active' | 'paused' | 'completed';
    lastActivityAt: string;
    createdAt: string;
}

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.projects) {
                setProjects(data.projects);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProjects(prev => prev.filter(p => p._id !== projectId));
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);



    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="page-container max-w-7xl mx-auto p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Projects</h1>
                    <p className="text-zinc-400 text-lg">Manage and monitor your tracked applications.</p>
                </div>
                <Link
                    to="/repositories"
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-500/20 px-6 py-4 rounded-xl text-base"
                >
                    <FolderGit2 className="w-5 h-5" />
                    New Project from Repo
                </Link>
            </div>

            {error && (
                <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center gap-3">
                    <Activity className="w-6 h-6" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-[#09090b] border border-white/5 rounded-[24px] animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-[#09090b] border border-white/5 rounded-[32px]">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FolderGit2 className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No projects yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
                        Connect a repository to start tracking metrics and workflows.
                    </p>
                    <Link to="/repositories" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg">
                        Browse Repositories
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-[#09090b] border border-white/5 rounded-[24px] p-8 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
                        >
                            {/* Ambient Glow on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${project.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-white/5'
                                        }`}>
                                        {project.status}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors line-clamp-1">
                                    {project.name}
                                </h3>

                                {project.description ? (
                                    <p className="text-zinc-400 mb-8 line-clamp-2 min-h-[3rem]">
                                        {project.description}
                                    </p>
                                ) : (
                                    <p className="text-zinc-600 italic mb-8 min-h-[3rem]">No description provided.</p>
                                )}

                                <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
                                    <a
                                        href={project.repository.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <FolderGit2 className="w-4 h-4" />
                                        {project.repository.fullName}
                                    </a>

                                    <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(project.lastActivityAt)}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project._id); }}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <Link
                                                to={`/projects/${project._id}`}
                                                className="p-1.5 hover:bg-violet-500/20 rounded-lg text-zinc-500 hover:text-violet-400 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link to={`/projects/${project._id}`} className="absolute inset-0 z-0 focus:outline-none" aria-label={`View ${project.name}`} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectList;
