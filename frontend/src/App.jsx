import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Medications from './pages/Medications';
import Documents from './pages/Documents';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p className="text-muted">Loading Panacea...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppRoutes() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p className="text-muted" style={{ marginTop: '1rem' }}>Loading Panacea...</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Navbar />
                            <div className="page-content">
                                <Home />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/medications"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Navbar />
                            <div className="page-content">
                                <Medications />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/documents"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Navbar />
                            <div className="page-content">
                                <Documents />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/emergency"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Navbar />
                            <div className="page-content">
                                <Emergency />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <div className="app-layout">
                            <Navbar />
                            <div className="page-content">
                                <Profile />
                            </div>
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
