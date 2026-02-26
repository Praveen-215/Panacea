import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const toast = useToast();

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.email, form.password);
                toast.success('Welcome back!');
            } else {
                await register(form.name, form.email, form.password);
                toast.success('Account created successfully!');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-bg__orb login-bg__orb--1" />
                <div className="login-bg__orb login-bg__orb--2" />
                <div className="login-bg__orb login-bg__orb--3" />
            </div>

            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">⚕️</div>
                    <h1 className="login-title">Panacea</h1>
                    <p className="login-subtitle">Your Personal Medical Assistant</p>
                </div>

                <div className="login-card glass-card">
                    <div className="login-tabs">
                        <button
                            className={`login-tab ${isLogin ? 'login-tab--active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`login-tab ${!isLogin ? 'login-tab--active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="login-name">Full Name</label>
                                <input
                                    id="login-name"
                                    className="form-input"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required={!isLogin}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email Address</label>
                            <input
                                id="login-email"
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                                minLength={6}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn--primary btn--lg btn--block"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner spinner--sm" />
                            ) : isLogin ? (
                                'Sign In'
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                <div className="login-features">
                    <div className="login-feature">
                        <span>💊</span>
                        <span>Track Medications</span>
                    </div>
                    <div className="login-feature">
                        <span>🔔</span>
                        <span>Smart Reminders</span>
                    </div>
                    <div className="login-feature">
                        <span>📁</span>
                        <span>Health Records</span>
                    </div>
                    <div className="login-feature">
                        <span>🆘</span>
                        <span>Emergency SOS</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
