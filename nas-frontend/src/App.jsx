import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardWrapper from './pages/DashboardWrapper';
import SidebarLayout from './components/SidebarLayout';

export default function App() {
  return (
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<DashboardWrapper />} />
        </Route>
      </Routes>
  );
}