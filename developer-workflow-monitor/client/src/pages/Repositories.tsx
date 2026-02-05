import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, RefreshCw, Star, GitFork, Lock, Globe, ArrowLeft } from 'lucide-react';

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
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchRepos();
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
                                {repos.length} repositories synced
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={syncRepos}
                        disabled={syncing}
                        className="btn-primary flex items-center gap-2"
                    >
                        <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync from GitHub'}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
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
                            <motion.a
                                key={repo._id}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -2 }}
                                className="glass-panel p-5 rounded-xl hover:border-primary/50 transition-colors block"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {repo.isPrivate ? (
                                            <Lock className="w-4 h-4 text-yellow-500" />
                                        ) : (
                                            <Globe className="w-4 h-4 text-green-500" />
                                        )}
                                        <h3 className="font-semibold text-lg hover:text-primary">
                                            {repo.name}
                                        </h3>
                                    </div>
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
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Repositories;
