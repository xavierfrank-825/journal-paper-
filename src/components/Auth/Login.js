import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { login as loginAPI, register as registerAPI } from '../../utils/auth';
import'./login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const response = await loginAPI(formData.username, formData.password);
                login(response.user);
            } else {
                await registerAPI(formData.username, formData.email, formData.password, formData.role);
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <div className="login-header">
                    <h2>{isLogin ? 'Login' : 'Register'}</h2>
                    <p>{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="toggle-form">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({
                                username: '',
                                email: '',
                                password: '',
                                role: 'user'
                            });
                        }}
                    >
                        {isLogin ? 'Need to register?' : 'Already have an account?'}
                    </button>
                </div>

                {isLogin && (
                    <div className="demo-credentials">
                        <p>Demo Credentials:</p>
                        <p>Admin: admin / admin123</p>
                        <p>User: testuser / user123</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;