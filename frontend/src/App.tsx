import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import NewEntryPage from './pages/NewEntryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JournalListPage from './pages/JournalListPage';
import { useJournalStore } from './store/journalStore';
import { useAuthStore } from './store/authStore';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

function PublicRoute() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}

function NewEntryRedirector() {
  const navigate = useNavigate();
  const createEntry = useJournalStore(state => state.createEntry);
  const creatingRef = useRef(false);
  
  useEffect(() => {
    if (creatingRef.current) return;
    creatingRef.current = true;

    const doCreate = async () => {
      try {
        const entry = await createEntry({
          title: '',
          content: '',
          date: new Date().toISOString(),
        });
        navigate(`/entry/${entry.id}`, { replace: true });
      } catch (error) {
        console.error('Failed to create entry:', error);
        navigate('/list', { replace: true });
      }
    };
    doCreate();
  }, [navigate, createEntry]);
  
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/new" replace />} />
            <Route path="/new" element={<NewEntryRedirector />} />
            <Route path="/entry/:id" element={<NewEntryPage />} />
            <Route path="/list" element={<JournalListPage />} />
            <Route path="/search" element={<div className="p-8 font-medium">Search Placeholder</div>} />
            <Route path="/settings" element={<div className="p-8 font-medium">Settings Placeholder</div>} />
            <Route path="/stats" element={<div className="p-8 font-medium">Stats Placeholder</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
