import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Github } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to backend.
        localStorage.setItem('token', 'fake-jwt-token');
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black z-0" />
            <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-8 rounded-2xl w-full max-w-md z-10 mx-4"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-text-muted">Start monitoring your workflow today</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                                required
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
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 group mt-6">
                        Sign Up
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#1e293b] text-text-muted">Or continue with</span>
                        </div>
                    </div>
                    <button className="mt-4 w-full flex items-center justify-center gap-2 bg-[#24292F] hover:bg-[#24292F]/90 text-white p-3 rounded-lg transition-colors border border-gray-700">
                        <Github className="w-5 h-5" />
                        <span>GitHub</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-text-muted text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
