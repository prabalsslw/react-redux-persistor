// src/components/ProtectedRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useSelector((state) => state.authhentication);

    if (isLoading) return <div>Loading...</div>; // Handle PersistGate loading
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};