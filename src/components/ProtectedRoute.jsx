import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute — verifica que exista un token en localStorage.
 * Si no hay token, redirige automáticamente a /login.
 * Si hay token, renderiza la ruta hija a través de <Outlet />.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
