import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TestTube, Plus, Play, Trash2, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface ApiTest {
    _id: string;
    name: string;
    method: string;
    url: string;
    updatedAt: string;
}

interface TestResult {
    status: number;
    responseTime: number;
    success: boolean;
    responseBody: any;
    error?: string;
}

const ApiTests = () => {
    const [tests, setTests] = useState<ApiTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [running, setRunning] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, TestResult>>({}); // Map testId -> latest result
    const [error, setError] = useState('');

    // Form State
    const [newName, setNewName] = useState('');
    const [newMethod, setNewMethod] = useState('GET');
    const [newUrl, setNewUrl] = useState('');
    const [newBody, setNewBody] = useState('');

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.tests) setTests(data.tests);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newName,
                    method: newMethod,
                    url: newUrl,
                    body: newBody ? newBody : undefined,
                    // Assertions can be added in V2
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setTests([data.test, ...tests]);
                setCreating(false);
                setNewName('');
                setNewUrl('');
                setNewBody('');
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const runTest = async (id: string) => {
        setRunning(id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tests/${id}/run`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, [id]: data.result }));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRunning(null);
        }
    };

    const deleteTest = async (id: string) => {
        if (!confirm('Delete this test?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/tests/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setTests(prev => prev.filter(t => t._id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen p-8 relative">
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-black -z-10" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <TestTube className="w-8 h-8 text-purple-400" />
                                API Tests
                            </h1>
                            <p className="text-text-muted mt-1">
                                Create and execute HTTP tests against your endpoints
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCreating(!creating)}
                        className="btn-primary bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Test
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Create Form */}
                <AnimatePresence>
                    {creating && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleCreate}
                            className="glass-panel p-6 rounded-xl mb-8 overflow-hidden"
                        >
                            <h3 className="text-xl font-semibold mb-4">Define API Test</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Test Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. User Login Flow"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1/4">
                                        <label className="block text-sm font-medium text-text-muted mb-1">Method</label>
                                        <select
                                            value={newMethod}
                                            onChange={e => setNewMethod(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                                        >
                                            <option>GET</option>
                                            <option>POST</option>
                                            <option>PUT</option>
                                            <option>DELETE</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-text-muted mb-1">URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={newUrl}
                                            onChange={e => setNewUrl(e.target.value)}
                                            placeholder="https://api.example.com/endpoint"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {['POST', 'PUT', 'PATCH'].includes(newMethod) && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-text-muted mb-1">Request Body (JSON)</label>
                                    <textarea
                                        value={newBody}
                                        onChange={e => setNewBody(e.target.value)}
                                        placeholder='{ "key": "value" }'
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:border-purple-500 h-32"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCreating(false)}
                                    className="px-4 py-2 text-text-muted hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-700">
                                    Save Test
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Tests List */}
                {loading ? (
                    <div className="text-center py-12 text-text-muted">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-12">
                        <TestTube className="w-16 h-16 mx-auto text-text-muted mb-4" />
                        <h3 className="text-xl font-medium mb-2">No API tests yet</h3>
                        <p className="text-text-muted">Create your first test to validate endpoints</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tests.map(test => (
                            <div key={test._id} className="glass-panel p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${test.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                                test.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                                    test.method === 'DELETE' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {test.method}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-lg">{test.name}</h3>
                                            <p className="text-xs text-text-muted">{test.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => runTest(test._id)}
                                            disabled={running === test._id}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <Play className={`w-4 h-4 ${running === test._id ? 'animate-spin' : ''}`} />
                                            {running === test._id ? 'Running...' : 'Run Test'}
                                        </button>
                                        <button
                                            onClick={() => deleteTest(test._id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-text-muted hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Results Area */}
                                {results[test._id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`mt-4 p-4 rounded-lg border ${results[test._id].success
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            {results[test._id].success ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            <span className={`font-semibold ${results[test._id].success ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                Status: {results[test._id].status}
                                            </span>
                                            <span className="text-sm text-text-muted flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {results[test._id].responseTime}ms
                                            </span>
                                        </div>

                                        {results[test._id].error && (
                                            <div className="text-red-400 text-sm mb-2">
                                                Error: {results[test._id].error}
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <div className="text-xs text-text-muted uppercase mb-1">Response Body</div>
                                            <pre className="bg-black/30 p-3 rounded text-xs overflow-auto max-h-40 font-mono text-purple-200">
                                                {typeof results[test._id].responseBody === 'object'
                                                    ? JSON.stringify(results[test._id].responseBody, null, 2)
                                                    : results[test._id].responseBody
                                                }
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTests;
