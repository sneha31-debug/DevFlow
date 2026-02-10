import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Clock, Activity, FileText, Github, User } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface Repository {
    _id: string;
    name: string;
    fullName: string;
    url: string;
    language?: string;
    stars: number;
    forks: number;
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

interface ActivityLog {
    _id: string;
    action: string;
    message: string;
    timestamp: string;
    metadata?: {
        author?: string;
        sha?: string;
        url?: string;
        [key: string]: any;
    };
}

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProject = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.project) {
                setProject(data.project);
                setLogs(data.logs || []);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const getActionColor = (action: string) => {
        const colors: Record<string, string> = {
            PROJECT_CREATED: 'bg-green-500/20 text-green-400 border-green-500/30',
            REPO_SYNC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            API_CALL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        return colors[action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-text-muted">Loading project...</div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-400">{error || 'Project not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 relative">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black -z-10" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/projects" className="text-text-muted hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        {project.description && (
                            <p className="text-text-muted mt-1">{project.description}</p>
                        )}
                    </div>
                </div>

                {/* Project Info Card */}
                <div className="glass-panel p-6 rounded-xl mb-8">
                    <div className="flex items-center gap-6 text-sm">
                        <a
                            href={project.repository.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:text-primary"
                        >
                            <Github className="w-5 h-5" />
                            {project.repository.fullName}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <div className="flex items-center gap-1 text-text-muted">
                            <Clock className="w-4 h-4" />
                            Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-text-muted">
                            <Activity className="w-4 h-4" />
                            Status: <span className="text-white capitalize">{project.status}</span>
                        </div>
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="glass-panel p-6 rounded-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Activity Logs
                    </h2>

                    {logs.length === 0 ? (
                        <p className="text-text-muted text-center py-8">
                            No activity logs yet for this project.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                {log.metadata?.author && (
                                                    <span className="text-xs text-text-muted flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {log.metadata.author}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white text-sm font-medium leading-relaxed truncate-2-lines">
                                                {log.message}
                                            </p>
                                            {log.metadata?.sha && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <code className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-primary/80">
                                                        {log.metadata.sha.substring(0, 7)}
                                                    </code>
                                                    {log.metadata.url && (
                                                        <a
                                                            href={log.metadata.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                                        >
                                                            View on GitHub
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-text-muted whitespace-nowrap pt-1">
                                            {formatTime(log.timestamp)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
