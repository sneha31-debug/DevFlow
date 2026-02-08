import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Github, User } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';
import { AuthStyles } from '../styles/AuthStyles';

const API_URL = 'http://localhost:5001';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, displayName: username }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
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

    const handleGithubRegister = () => {
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
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <h1 className={AuthStyles.title}>Create Account</h1>
                            <p className={AuthStyles.subtitle}>Join DevFlow to monitor your APIs</p>
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

                        <div className="space-y-10">
                            {/* GitHub */}
                            <button onClick={handleGithubRegister} className={`group ${AuthStyles.githubBtn}`}>
                                <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                Continue with GitHub
                            </button>

                            {/* Divider */}
                            <div className={AuthStyles.divider}>
                                <div className={AuthStyles.dividerLine} />
                                <div className="flex justify-center">
                                    <span className={AuthStyles.dividerText}>OR USING EMAIL</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleRegister} className="space-y-8">
                                <div>
                                    <label className={AuthStyles.label}>USERNAME</label>
                                    <div className={AuthStyles.inputWrapper}>
                                        <User className={AuthStyles.inputIcon} />
                                        <input
                                            type="text"
                                            className={AuthStyles.input}
                                            placeholder="johndoe"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>

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

                                <div>
                                    <label className={AuthStyles.label}>CONFIRM PASSWORD</label>
                                    <div className={AuthStyles.inputWrapper}>
                                        <Lock className={AuthStyles.inputIcon} />
                                        <input
                                            type="password"
                                            className={AuthStyles.input}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group mt-2 ${AuthStyles.submitBtn}`}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <p className={AuthStyles.footerText}>
                            Already have an account?{' '}
                            <Link to="/login" className={AuthStyles.footerLink}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;