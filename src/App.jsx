import { BrowserRouter, Routes, Route } from 'react-router';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulations from './pages/Simulations';
import SimulationDetails from './pages/SimulationDetails';
import Result from './pages/Result';
import Profile from './pages/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminSimulations from './pages/admin/AdminSimulations';
import AdminSettings from './pages/admin/AdminSettings';
import NotFound from './pages/NotFound';

function App() {
  return (
    // basename lets the app work under /tamheed/ on GitHub Pages
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Language and theme come first, because every page uses them */}
      <PreferencesProvider>
        <ToastProvider>
          <AuthProvider>
            <ScrollToTop />
            <Navbar />
            <main id="main" className="page">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/simulations" element={<ProtectedRoute><Simulations /></ProtectedRoute>} />
                <Route path="/simulations/:id" element={<ProtectedRoute><SimulationDetails /></ProtectedRoute>} />
                <Route path="/results/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                {/* Nested admin routes: AdminLayout shows the tabs, the child page shows below them */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:uid" element={<AdminUserDetail />} />
                  <Route path="simulations" element={<AdminSimulations />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
