import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas públicas
import Login    from './pages/Login';
import Register from './pages/Register';

// Guards y Layout
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute     from './components/AdminRoute';
import Layout         from './components/Layout';

// Páginas protegidas
import Dashboard      from './pages/Dashboard';
import Activos        from './pages/Activos';
import Prestamos      from './pages/Prestamos';
import Mantenimientos from './pages/Mantenimientos';
import Profile        from './pages/Profile';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
        {/* ── Rutas públicas ──────────────────────────── */}
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Rutas protegidas (requieren token) ─────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activos"   element={<Activos />} />
            <Route path="/prestamos" element={<Prestamos />} />
            <Route path="/perfil"    element={<Profile />} />

            {/* Solo Administradores */}
            <Route element={<AdminRoute />}>
              <Route path="/mantenimientos" element={<Mantenimientos />} />
            </Route>
          </Route>
        </Route>

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
