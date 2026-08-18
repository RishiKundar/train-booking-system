import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/Toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import TrainDetails from './pages/TrainDetails';
import Payment from './pages/Payment';
import Admin from './pages/Admin';

// Protected Route Component for Authenticated Users
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#38BDF8', fontSize: '1.2rem', gap: '0.75rem' }}>
                <span className="spin">⚡</span> Loading ChooChoo...
            </div>
        );
    }
    
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    
    return children;
};

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
            <Router>
                <ToastContainer />
                <Navbar />
                <Routes>
                    {/* Public Landing & Discovery */}
                    <Route path="/" element={<Landing />} />

                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Passenger Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/search" element={<Search />} />
                    <Route path="/booking/:trainId" element={
                        <ProtectedRoute>
                            <TrainDetails />
                        </ProtectedRoute>
                    }/>
                    <Route path="/payment/:pnr" element={
                        <ProtectedRoute>
                            <Payment />
                        </ProtectedRoute>
                    }/>

                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    }/>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
