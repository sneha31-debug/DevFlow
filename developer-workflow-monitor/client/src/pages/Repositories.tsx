import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, RefreshCw, Star, GitFork, Lock, Globe, ArrowLeft, Plus, Check } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface Repository {
    _id: string;
    name: string;
    fullName: string;
    description?: string;
    url: string;
    language?: string;
    isPrivate: boolean;
    stars: number;
    forks: number;
    lastSyncedAt: string;
}

const Repositories = () => {
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [addingProject, setAddingProject] = useState<string | null>(null);
    const [addedProjects, setAddedProjects] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchRepos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/github/repos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.repos) {
                setRepos(data.repos);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.projects) {
                const projectRepoIds = new Set(data.projects.map((p: any) => p.repository._id));
                setAddedProjects(projectRepoIds as Set<string>);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const syncRepos = async () => {
        setSyncing(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/github/repos/sync`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.repos) {
                setRepos(data.repos);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };

    const addToProject = async (repo: Repository) => {
        setAddingProject(repo._id);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repositoryId: repo._id,
                    name: repo.name,
                    description: repo.description,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setAddedProjects(prev => new Set([...prev, repo._id]));
                setSuccess(`Project "${repo.name}" created successfully!`);
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAddingProject(null);
        }
    };

    useEffect(() => {
        fetchRepos();
        fetchExistingProjects();
    }, []);

    const getLanguageColor = (lang: string) => {
        const colors: Record<string, string> = {
            JavaScript: '#f1e05a',
            TypeScript: '#3178c6',
            Python: '#3572A5',
            Java: '#b07219',
            Go: '#00ADD8',
            Rust: '#dea584',
            Ruby: '#701516',
            Unknown: '#6e7681',
        };
        return colors[lang] || '#6e7681';
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
                                <Github className="w-8 h-8" />
                                My Repositories
                            </h1>
                            <p className="text-text-muted mt-1">
                                {repos.length} repositories synced • Click "Add to Project" to track
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/projects" className="btn-secondary flex items-center gap-2">
                            View Projects
                        </Link>
                        <button
                            onClick={syncRepos}
                            disabled={syncing}
                            className="btn-primary flex items-center gap-2"
                        >
                            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Syncing...' : 'Sync from GitHub'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-text-muted">
                        Loading repositories...
                    </div>
                ) : repos.length === 0 ? (
                    <div className="text-center py-12">
                        <Github className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <h3 className="text-xl font-medium mb-2">No repositories synced</h3>
                        <p className="text-text-muted mb-4">
                            Click "Sync from GitHub" to import your repositories
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repos.map((repo) => (
                            <motion.div
                                key={repo._id}
                                whileHover={{ y: -2 }}
                                className="glass-panel p-5 rounded-xl"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-primary"
                                    >
                                        {repo.isPrivate ? (
                                            <Lock className="w-4 h-4 text-yellow-500" />
                                        ) : (
                                            <Globe className="w-4 h-4 text-green-500" />
                                        )}
                                        <h3 className="font-semibold text-lg">
                                            {repo.name}
                                        </h3>
                                    </a>
                                    {addedProjects.has(repo._id) ? (
                                        <span className="flex items-center gap-1 text-sm text-green-400">
                                            <Check className="w-4 h-4" />
                                            In Projects
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => addToProject(repo)}
                                            disabled={addingProject === repo._id}
                                            className="flex items-center gap-1 text-sm px-3 py-1 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {addingProject === repo._id ? 'Adding...' : 'Add to Project'}
                                        </button>
                                    )}
                                </div>

                                {repo.description && (
                                    <p className="text-sm text-text-muted mb-3 line-clamp-2">
                                        {repo.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-text-muted">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                                            />
                                            {repo.language}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        {repo.stars}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <GitFork className="w-4 h-4" />
                                        {repo.forks}
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

export default Repositories;
