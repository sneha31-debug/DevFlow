import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderGit2, ArrowLeft, Trash2, ExternalLink, Clock, Activity } from 'lucide-react';

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

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-500/20 text-green-400 border-green-500/30',
            paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return colors[status] || colors.active;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen p-8 relative">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black -z-10" />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <FolderGit2 className="w-8 h-8" />
                                My Projects
                            </h1>
                            <p className="text-text-muted mt-1">
                                {projects.length} project{projects.length !== 1 ? 's' : ''} tracked
                            </p>
                        </div>
                    </div>
                    <Link to="/repositories" className="btn-primary flex items-center gap-2">
                        Add from Repositories
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-text-muted">
                        Loading projects...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderGit2 className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                        <p className="text-text-muted mb-4">
                            Add a repository to start tracking your projects
                        </p>
                        <Link to="/repositories" className="btn-primary">
                            Browse Repositories
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 rounded-xl"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link
                                                to={`/projects/${project._id}`}
                                                className="text-xl font-semibold hover:text-primary transition-colors"
                                            >
                                                {project.name}
                                            </Link>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        {project.description && (
                                            <p className="text-text-muted mb-3">{project.description}</p>
                                        )}

                                        <div className="flex items-center gap-6 text-sm text-text-muted">
                                            <a
                                                href={project.repository.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-primary"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                {project.repository.fullName}
                                            </a>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Created {formatDate(project.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Activity className="w-4 h-4" />
                                                Last activity {formatDate(project.lastActivityAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/projects/${project._id}`}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Activity className="w-5 h-5 text-text-muted hover:text-white" />
                                        </Link>
                                        <button
                                            onClick={() => deleteProject(project._id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-5 h-5 text-text-muted hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
