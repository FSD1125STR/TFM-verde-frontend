import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../contexts/LoginContext.jsx";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logoutEmployee } = useContext(LoginContext);

    const menuItems = [
        { label: "Panel Control", path: "/" },
        { label: "Empleados", path: "/employees" },
        { label: "Recepción Vehículo", path: "/vehicle-reception" },
        { label: "Órdenes de Trabajo", path: "/work-orders" },
        { label: "Mi Perfil", path: "/profile" },
        { label: "Sistema Diseño", path: "/design-system" },
    ];

    const handleLogout = async () => {
        await logoutEmployee();
        navigate("/login");
    };

    return (
        <aside className="w-72 min-h-screen bg-neutral text-white flex flex-col justify-between px-5 py-6">
        <div>
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow">
                🚗
            </div>

            <div>
                <p className="font-bold text-lg leading-none">Mechanic Manager</p>
                <p className="text-sm text-white/70">Taller Mecánico</p>
            </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
            {menuItems.map((item) => {
                const active = location.pathname === item.path;

                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    active
                        ? "bg-primary text-white shadow"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                    <span className="text-base">•</span>
                    {item.label}
                </Link>
                );
            })}
            </nav>
        </div>

        {/* Footer sidebar */}
        <div className="space-y-4">
            <button className="btn btn-sm btn-outline w-full text-white border-white/20 hover:bg-white hover:text-neutral rounded-xl">
            🌙 Modo Oscuro
            </button>

            <div className="bg-white/5 rounded-xl p-4">
            <p className="font-semibold text-sm">Administrador</p>
            <p className="text-xs text-white/60">Sesión activa</p>
            </div>

            <button
            onClick={handleLogout}
            className="btn btn-ghost justify-start text-white/90 hover:text-white rounded-xl"
            >
            ↪ Cerrar Sesión
            </button>
        </div>
        </aside>
    );
}