import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Github } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for token in URL (redirected from backend)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Clear the token from URL for cleaner history
            navigate('/', { replace: true });
        }
    }, [location, navigate]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to backend email/pass login. 
        // For now, simulator success or use GitHub.
        localStorage.setItem('token', 'fake-jwt-token');
        navigate('/');
    };

    const handleGithubLogin = () => {
        // Redirect to backend GitHub auth route
        window.location.href = 'http://localhost:5000/api/auth/github';
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-8 rounded-2xl w-full max-w-md z-10 mx-4"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-text-muted">Sign in to monitor your APIs</p>
                </div>

                <div className="mb-6">
                    <button
                        onClick={handleGithubLogin}
                        className="w-full flex items-center justify-center gap-2 bg-[#24292F] hover:bg-[#24292F]/90 text-white p-3 rounded-lg transition-colors border border-gray-700 font-medium"
                    >
                        <Github className="w-5 h-5" />
                        Sign in with GitHub
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#1e293b] text-text-muted">Or continue with email</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                            <input
                                type="email"
                                className="input-field pl-10"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            // required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                            <input
                                type="password"
                                className="input-field pl-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            // required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 group">
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-text-muted text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                        Create account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
