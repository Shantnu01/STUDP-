// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useToast, ToastContainer } from './hooks/useToast.jsx';
import Shell from './components/Shell.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Schools from './pages/Schools.jsx';
import Billing from './pages/Billing.jsx';
import { Invoices, Requests, Analytics, Messages, Settings } from './pages/OtherPages.jsx';
import { Spinner } from './components/UI.jsx';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/schools"   element={<Schools   />} />
        <Route path="/requests"  element={<Requests  />} />
        <Route path="/billing"   element={<Billing   />} />
        <Route path="/invoices"  element={<Invoices  />} />
        <Route path="/messages"  element={<Messages  />} />
        <Route path="/settings"  element={<Settings  />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*"     element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  const { toasts } = useToast();

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer toasts={toasts} />
      </BrowserRouter>
    </AuthProvider>
  );
}
