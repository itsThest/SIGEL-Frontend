import { Navigate, Outlet } from 'react-router-dom';
import { isAdmin } from '../utils/auth';

/**
 * AdminRoute — sólo permite el paso si el usuario es Administrador.
 * Si no lo es, redirige a /dashboard.
 */
const AdminRoute = () =>
  isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;

export default AdminRoute;
