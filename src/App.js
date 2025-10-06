// frontend/src/App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserDashboard from './components/User/UserDashboard';
import Login from './components/Auth/Login';
import './App.css';

function AppContent() {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    if (user?.role === 'admin') {
        return (
            <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <UserDashboard />
        </ProtectedRoute>
    );
}

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <AppContent />
            </div>
        </AuthProvider>
    );
}

export default App;