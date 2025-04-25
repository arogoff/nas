import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardWrapper from "./pages/DashboardWrapper";
import SidebarLayout from "./components/SidebarLayout";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<SidebarLayout />}>
        <Route path="/" element={<DashboardWrapper />} />
      </Route>
    </Routes>
  );
}
