import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Github } from 'lucide-react';

const API_URL = 'http://localhost:5001';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for token in URL (redirected from GitHub OAuth)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            fetchUserProfile(token);
        }
    }, [location]);

    const fetchUserProfile = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            navigate('/', { replace: true });
        } catch (err) {
            navigate('/', { replace: true });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = () => {
        window.location.href = `${API_URL}/api/auth/github`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0F1117]">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[128px] animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="glass-card p-8 shadow-2xl shadow-black/50">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400">Sign in to monitor your APIs</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <button
                            onClick={handleGithubLogin}
                            className="w-full flex items-center justify-center gap-3 bg-[#24292F] hover:bg-[#24292F]/80 text-white p-3.5 rounded-xl transition-all border border-white/10 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Github className="w-5 h-5" />
                            Sign in with GitHub
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                                <span className="px-4 bg-[#14161B] text-slate-500">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-11 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="password"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-11 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white p-3.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    <p className="mt-8 text-center text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
