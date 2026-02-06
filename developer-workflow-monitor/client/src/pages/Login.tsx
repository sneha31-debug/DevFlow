import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Github } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';
import { AuthStyles } from '../styles/AuthStyles';

const API_URL = 'http://localhost:5001';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
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
        <div className={AuthStyles.page}>
            <AuthBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className={AuthStyles.cardWrapper}>
                    <div className={AuthStyles.cardGlow} />
                    <div className={AuthStyles.card}>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className={AuthStyles.iconBadge}>
                                <Lock className="w-7 h-7 text-white" />
                            </div>
                            <h1 className={AuthStyles.title}>Welcome Back</h1>
                            <p className={AuthStyles.subtitle}>Sign in to your workflow dashboard</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={AuthStyles.error}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-8">
                            {/* GitHub */}
                            <button onClick={handleGithubLogin} className={`group ${AuthStyles.githubBtn}`}>
                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Continue with GitHub
                            </button>

                            {/* Divider */}
                            <div className={AuthStyles.divider}>
                                <div className={AuthStyles.dividerLine} />
                                <div className="flex justify-center">
                                    <span className={AuthStyles.dividerText}>OR CONTINUE WITH</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className={AuthStyles.label}>EMAIL ADDRESS</label>
                                    <div className={AuthStyles.inputWrapper}>
                                        <Mail className={AuthStyles.inputIcon} />
                                        <input
                                            type="email"
                                            className={AuthStyles.input}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={AuthStyles.label}>PASSWORD</label>
                                    <div className={AuthStyles.inputWrapper}>
                                        <Lock className={AuthStyles.inputIcon} />
                                        <input
                                            type="password"
                                            className={AuthStyles.input}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group mt-2 ${AuthStyles.submitBtn}`}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className={AuthStyles.footerText}>
                            Don't have an account?{' '}
                            <Link to="/register" className={AuthStyles.footerLink}>
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;