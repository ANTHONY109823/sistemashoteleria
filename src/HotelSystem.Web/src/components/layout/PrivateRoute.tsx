import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
    roles?: string[];
}

const PrivateRoute = ({ roles }: PrivateRouteProps) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roles && roles.length > 0 && userRole) {
        if (!roles.includes(userRole)) {
            // Role not authorized, redirect to dashboard or unauthorized page
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default PrivateRoute;
