import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../contexts/AuthContext.js";
import { logout } from "../../services/logoutApi.js";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, setIsAuthenticated } = useContext(LoginContext);

  const menuItems = [
    { label: "Panel Control", path: "/" },
    { label: "Empleados", path: "/employees" },
    { label: "Recepción Vehículo", path: "/vehicle-reception" },
    { label: "Órdenes de Trabajo", path: "/work-orders" },
    { label: "Chat", path: "/chat" },
    { label: "Mi Perfil", path: "/profile" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  const roleLabel =
    profile?.employee?.rol?.name ||
    profile?.employee?.rol ||
    "Sin rol";

  const userLabel =
    profile?.employee?.name ||
    profile?.employee?.name_company ||
    profile?.employee?.email ||
    "Sesión iniciada";

  return (
    <aside className="w-72 min-h-screen bg-[#0F172A] text-white flex flex-col justify-between px-5 py-6">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
            🚗
          </div>

          <div>
            <p className="font-bold text-lg">Mechanic Manager</p>
            <p className="text-sm text-white/60">Taller Mecánico</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                • {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="font-semibold text-sm">{userLabel}</p>
          <p className="text-xs text-white/60">{roleLabel}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl px-4 py-3 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}