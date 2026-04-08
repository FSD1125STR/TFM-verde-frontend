import { useMemo, useState } from "react";

const initialEmployees = [];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadge(role) {
  switch (role) {
    case "Admin":
      return "bg-purple-500/20 text-purple-300";
    case "Recepcionista":
      return "bg-blue-500/20 text-blue-300";
    case "Mecánico":
      return "bg-orange-500/20 text-orange-300";
    default:
      return "bg-white/10 text-white/70";
  }
}

function getStatusBadge(status) {
  return status === "Activo"
    ? "bg-emerald-500/20 text-emerald-300"
    : "bg-white/10 text-white/60";
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Recepcionista",
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "Todos" || employee.role === roleFilter;

      const matchesStatus =
        statusFilter === "Todos" || employee.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      role: "Recepcionista",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.role) {
      return;
    }
    // modificar por endpoint real de backend
    const newEmployee = {
      id: Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: "Activo",
    };

    setEmployees((prev) => [...prev, newEmployee]);
    closeModal();
  };

  const handleDeleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  return (
    <>
      <section className="max-w-6xl space-y-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
            <p className="text-white/60">
              Administra el personal del taller y sus permisos.
            </p>
          </div>

          <button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
          >
            Añadir Empleado
          </button>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#1F2937] px-4 py-3 rounded-xl outline-none lg:w-52"
            >
              <option value="Todos">Todos los Roles</option>
              <option value="Admin">Admin</option>
              <option value="Recepcionista">Recepcionista</option>
              <option value="Mecánico">Mecánico</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1F2937] px-4 py-3 rounded-xl outline-none lg:w-52"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/60 uppercase text-xs">
                <tr>
                  <th className="text-left px-6 py-4">Empleado</th>
                  <th className="text-left px-6 py-4">Rol</th>
                  <th className="text-left px-6 py-4">Estado</th>
                  <th className="text-right px-6 py-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-t border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-semibold">
                            {getInitials(employee.name)}
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {employee.name}
                            </p>
                            <p className="text-white/50 text-xs">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                            employee.role
                          )}`}
                        >
                          {employee.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            employee.status
                          )}`}
                        >
                          {employee.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-white/50 hover:text-red-400 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-white/5">
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-white/50"
                    >
                      No hay empleados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F172A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-2xl font-bold text-white">Nuevo Empleado</h2>

              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="px-6 py-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Email corporativo
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Rol en el taller
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5"
                  >
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Mecánico">Mecánico</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-white/80 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}