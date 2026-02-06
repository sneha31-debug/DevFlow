import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Play, Save, Trash2,
    Clock, Globe, ArrowLeft, XCircle, Search, Copy, Check
} from 'lucide-react';

const API_URL = 'http://localhost:5001';

interface ApiTest {
    _id?: string;
    name: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    updatedAt?: string;
}

const METHOD_COLORS = {
    GET: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    POST: 'text-green-400 bg-green-500/10 border-green-500/20',
    PUT: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
    PATCH: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
};

const ApiTests = () => {
    const navigate = useNavigate();
    // Data State
    const [tests, setTests] = useState<ApiTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editor State
    const [activeTest, setActiveTest] = useState<ApiTest>({
        name: 'New Request',
        method: 'GET',
        url: '',
        headers: {},
        body: ''
    });
    const [headersStr, setHeadersStr] = useState('{}');
    const [bodyStr, setBodyStr] = useState('{}');

    // UI State
    const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'response'>('body');
    const [response, setResponse] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState('');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [copied, setCopied] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchTests();
    }, []);

    // Sync activeTest strings when activeTest changes (e.g. selecting from list)
    useEffect(() => {
        setBodyStr(activeTest.body ? (typeof activeTest.body === 'string' ? activeTest.body : JSON.stringify(activeTest.body, null, 2)) : '{}');
        setHeadersStr(activeTest.headers ? JSON.stringify(activeTest.headers, null, 2) : '{}');
        setResponse(null);
        setUnsavedChanges(false);
    }, [activeTest._id]); // Only reset when switching test IDs

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

    const handleSelectTest = (test: ApiTest) => {
        setActiveTest(test);
    };

    const handleNewTest = () => {
        setActiveTest({
            name: 'New Request',
            method: 'GET',
            url: '',
            headers: {},
            body: ''
        });
        setHeadersStr('{}');
        setBodyStr('{}');
        setResponse(null);
    };

    const handleSave = async () => {
        try {
            // Validate JSON
            let parsedHeaders;
            try {
                JSON.parse(bodyStr); // Validate body
            } catch (e) {
                setError('Invalid JSON in Body');
                return;
            }
            try {
                parsedHeaders = JSON.parse(headersStr);
            } catch (e) {
                setError('Invalid JSON in Headers');
                return;
            }

            const token = localStorage.getItem('token');
            const method = activeTest._id ? 'PUT' : 'POST';
            const url = activeTest._id
                ? `${API_URL}/api/tests/${activeTest._id}`
                : `${API_URL}/api/tests`;

            const payload = {
                ...activeTest,
                body: bodyStr, // Store as string to avoid [object Object]
                headers: parsedHeaders
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                if (activeTest._id) {
                    setTests(prev => prev.map(t => t._id === activeTest._id ? data.test : t));
                } else {
                    setTests([data.test, ...tests]);
                }
                setActiveTest(data.test);
                setUnsavedChanges(false);
                setError('');
                // alert('Test Saved!'); // visual indicator is better
            } else {
                setError(data.message);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setResponse(null);
        setActiveTab('response');
        try {
            // Validate JSON
            let parsedBody, parsedHeaders;
            try {
                parsedBody = JSON.parse(bodyStr);
            } catch (e) {
                setError('Invalid JSON in Body');
                setIsRunning(false);
                return;
            }
            try {
                parsedHeaders = JSON.parse(headersStr);
            } catch (e) {
                setError('Invalid JSON in Headers');
                setIsRunning(false);
                return;
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/tests/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    url: activeTest.url,
                    method: activeTest.method,
                    headers: parsedHeaders,
                    body: parsedBody
                }),
            });

            const data = await res.json();
            setResponse(data.result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this test?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/tests/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setTests(prev => prev.filter(t => t._id !== id));
            if (activeTest._id === id) handleNewTest();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Watch for changes to mark unsaved
    useEffect(() => {
        if (!activeTest._id) return; // Ignore on new test
        setUnsavedChanges(true);
    }, [activeTest.url, activeTest.method, activeTest.name, bodyStr, headersStr]);

    const filteredTests = tests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-screen bg-[#0F1117] text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Sidebar */}
            <div className="w-72 border-r border-white/5 flex flex-col bg-[#13161C]">
                <div className="p-4 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/')}>
                            <ArrowLeft className="w-4 h-4 text-text-muted" />
                            <h2 className="font-bold text-sm tracking-wide">COLLECTION</h2>
                        </div>
                        <button
                            onClick={handleNewTest}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded-md transition-all shadow-lg shadow-purple-900/20"
                            title="New Request"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter requests..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder-slate-600"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                            Loading...
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-xs">
                            {searchTerm ? 'No matches found' : 'No requests yet'}
                        </div>
                    ) : (
                        filteredTests.map(test => (
                            <div
                                key={test._id}
                                onClick={() => handleSelectTest(test)}
                                className={`p-3 rounded-lg cursor-pointer group flex items-center justify-between transition-all duration-200 border ${activeTest._id === test._id
                                    ? 'bg-purple-500/10 border-purple-500/20 shadow-sm'
                                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                                    }`}
                            >
                                <div className="overflow-hidden flex-1 min-w-0">
                                    <div className={`font-medium truncate text-sm flex items-center gap-2 mb-1.5 ${activeTest._id === test._id ? 'text-purple-200' : 'text-slate-300'}`}>
                                        {test.name}
                                        {activeTest._id === test._id && unsavedChanges && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-orange-500/50 shadow-[0_0_8px]" title="Unsaved Changes" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[test.method as keyof typeof METHOD_COLORS] || 'text-slate-400 border-slate-700'}`}>
                                            {test.method}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(test._id!, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F1117] relative z-0">
                {/* Top Bar */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4 bg-[#13161C] z-10 shadow-sm">
                    <div className="flex items-center flex-1 bg-black/20 border border-white/10 rounded-lg p-1 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all">
                        <select
                            value={activeTest.method}
                            onChange={e => setActiveTest({ ...activeTest, method: e.target.value })}
                            className="bg-transparent border-none text-xs font-bold px-3 py-1.5 outline-none focus:ring-0 cursor-pointer text-slate-300 hover:text-white uppercase"
                        >
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                            <option>PATCH</option>
                        </select>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <input
                            type="text"
                            value={activeTest.url}
                            onChange={e => setActiveTest({ ...activeTest, url: e.target.value })}
                            placeholder="Enter request URL"
                            className="flex-1 bg-transparent border-none px-3 py-1.5 outline-none text-sm font-mono text-purple-100 placeholder-slate-600 focus:ring-0"
                        />
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                        {isRunning ? 'Sending...' : 'Send'}
                    </button>

                    <button
                        onClick={handleSave}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all border border-white/5"
                    >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>

                {/* Tabs & Content */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Subtle Grid Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

                    <div className="border-b border-white/5 px-6 flex items-center gap-8 bg-[#13161C]">
                        <div className="flex gap-1">
                            {['body', 'headers', 'response'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`relative py-4 px-4 text-xs font-semibold tracking-wide transition-colors uppercase ${activeTab === tab
                                        ? 'text-purple-400'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    )}
                                    {tab === 'response' && response && (
                                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${response.status < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>{response.status}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Name Input */}
                        <div className="ml-auto flex items-center max-w-xs">
                            <input
                                type="text"
                                value={activeTest.name}
                                onChange={e => setActiveTest({ ...activeTest, name: e.target.value })}
                                className="bg-transparent border-b border-transparent hover:border-white/10 focus:border-purple-500 text-right text-sm text-slate-400 focus:text-white outline-none transition-all py-1 w-full"
                                placeholder="Request Name"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative flex flex-col">
                        {error && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-medium flex items-center gap-3 shadow-xl backdrop-blur-md">
                                {error}
                                <button onClick={() => setError('')}><XCircle className="w-3.5 h-3.5 hover:text-white" /></button>
                            </div>
                        )}

                        {activeTab === 'body' && (
                            <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">JSON Body</h3>
                                    <button
                                        onClick={() => {
                                            try { setBodyStr(JSON.stringify(JSON.parse(bodyStr), null, 2)) } catch (e) { }
                                        }}
                                        className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline"
                                    >
                                        Prettify
                                    </button>
                                </div>
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none rounded-xl" />
                                    <textarea
                                        value={bodyStr}
                                        onChange={e => setBodyStr(e.target.value)}
                                        className="w-full h-full bg-[#0A0C10] border border-white/5 rounded-xl p-6 font-mono text-sm leading-relaxed text-slate-300 outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/10 resize-none shadow-inner"
                                        placeholder="{}"
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'headers' && (
                            <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Headers (JSON)</h3>
                                <textarea
                                    value={headersStr}
                                    onChange={e => setHeadersStr(e.target.value)}
                                    className="w-full flex-1 bg-[#0A0C10] border border-white/5 rounded-xl p-6 font-mono text-sm leading-relaxed text-slate-300 outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/10 resize-none shadow-inner"
                                    placeholder='{ "Content-Type": "application/json" }'
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {activeTab === 'response' && (
                            <div className="h-full flex flex-col bg-[#0A0C10]">
                                {response ? (
                                    <>
                                        <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${response.status < 300 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                                                    <span className={`text-sm font-bold ${response.status < 300 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {response.status} {response.status === 200 ? 'OK' : ''}
                                                    </span>
                                                </div>
                                                <div className="h-4 w-px bg-white/10" />
                                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {response.responseTime}ms
                                                </div>
                                                <div className="h-4 w-px bg-white/10" />
                                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    {typeof response.responseBody === 'string' ? response.responseBody.length : JSON.stringify(response.responseBody).length} B
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => copyToClipboard(typeof response.responseBody === 'object' ? JSON.stringify(response.responseBody, null, 2) : response.responseBody)}
                                                className="text-xs flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copied ? 'Copied' : 'Copy Response'}
                                            </button>
                                        </div>
                                        <div className="flex-1 relative overflow-hidden">
                                            <pre className="absolute inset-0 overflow-auto p-6 font-mono text-xs text-purple-200 leading-relaxed">
                                                {typeof response.responseBody === 'object'
                                                    ? JSON.stringify(response.responseBody, null, 2)
                                                    : response.responseBody
                                                }
                                            </pre>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
                                            <Globe className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <p className="text-sm">Send a request to inspect the response</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiTests;
