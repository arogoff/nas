import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardWrapper from "./pages/DashboardWrapper";
import SidebarLayout from "./components/SidebarLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./context/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<DashboardWrapper />} />
          </Route>
        </Route>

        {/* Redirect any unknown routes to login or dashboard based on auth status */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
