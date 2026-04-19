import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { label: "Panel Control", path: "/" },
    { label: "Empleados", path: "/employees" },
    { label: "Recepción Vehículo", path: "/vehicle-reception" },
    { label: "Órdenes de Trabajo", path: "/work-orders" },
    { label: "Mi Perfil", path: "/profile" },
  ];

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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                  active
                    ? "bg-blue-600"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                • {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-sm text-white/60">
        Administrador
      </div>
    </aside>
  );
}
