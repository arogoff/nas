import { memo } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FolderIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: DocumentDuplicateIcon },
  { name: "Groups", path: "/groups", icon: UsersIcon },
  { name: "Audit Log", path: "/log", icon: ClockIcon },
];

const NavItem = memo(({ item }) => (
  <NavLink
    to={item.path}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.5rem 0.75rem",
      borderRadius: "6px",
      fontSize: "0.9rem",
      fontWeight: "500",
      textDecoration: "none",
      color: isActive ? "#fff" : "#374151",
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      transition: "background-color 0.2s",
    })}
  >
    <item.icon style={{ height: "20px", width: "20px" }} />
    <span>{item.name}</span>
  </NavLink>
));

function SidebarLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#fff",
          borderRight: "1px solid #e5e7eb",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#1d4ed8",
            marginBottom: "2rem",
          }}
        >
          <Link
            to="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            MyNAS
          </Link>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {navItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 0.75rem",
            marginTop: "2rem",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#374151",
            backgroundColor: "transparent",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ArrowRightOnRectangleIcon
            style={{ height: "20px", width: "20px" }}
          />
          <span>Logout</span>
        </button>

        <div
          style={{
            marginTop: "auto",
            fontSize: "0.75rem",
            color: "#9ca3af",
            paddingTop: "1.5rem",
          }}
        >
          Created by Alex Rogoff
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default memo(SidebarLayout);
