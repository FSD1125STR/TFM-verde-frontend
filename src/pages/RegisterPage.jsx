import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../services/RegisterApi.js";

const registerFields = [
  {
    name: "name",
    label: "Nombre comercial del taller",
    placeholder: "Ej. Precision Motors SL",
    type: "text",
    requiredMessage: "Nombre obligatorio",
    colSpan: "md:col-span-2",
  },
  {
    name: "cif",
    label: "Identificación fiscal",
    placeholder: "B12345678",
    type: "text",
    requiredMessage: "CIF obligatorio",
    colSpan: "",
  },
  {
    name: "postal_code",
    label: "Código postal",
    placeholder: "28001",
    type: "text",
    requiredMessage: "Código postal obligatorio",
    colSpan: "",
  },
  {
    name: "address",
    label: "Dirección social",
    placeholder: "Calle, número, oficina...",
    type: "text",
    requiredMessage: "Dirección obligatoria",
    colSpan: "md:col-span-2",
  },
  {
    name: "country",
    label: "País",
    placeholder: "España",
    type: "text",
    requiredMessage: "País obligatorio",
    colSpan: "",
  },
  {
    name: "city",
    label: "Ciudad",
    placeholder: "Madrid",
    type: "text",
    requiredMessage: "Ciudad obligatoria",
    colSpan: "",
  },
  {
    name: "state",
    label: "Estado / Provincia",
    placeholder: "Madrid",
    type: "text",
    requiredMessage: "Estado obligatorio",
    colSpan: "md:col-span-2",
  },
  {
    name: "email",
    label: "Email de administrador",
    placeholder: "admin@taller.com",
    type: "email",
    requiredMessage: "Email obligatorio",
    colSpan: "md:col-span-2",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");

  const onSubmitHandler = async (data) => {
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await registerCompany({
        cif: data.cif,
        name: data.name,
        address: data.address,
        country: data.country,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        email: data.email,
        password: data.password,
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl bg-[#0F172A] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/10">
        <div className="bg-blue-600 text-white p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                🔧
              </div>

              <div>
                <p className="font-bold text-lg text-white">
                  Mechanic Manager
                </p>
                <p className="text-sm opacity-80 text-white">
                  Taller Mecánico
                </p>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-10 text-white">
              Digitaliza tu taller con tecnología de punta.
            </h1>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  ⚙️
                </div>

                <div>
                  <p className="font-semibold uppercase text-sm text-white">
                    Ecosistema centralizado
                  </p>

                  <p className="text-sm opacity-80 text-white">
                    Gestiona cada aspecto operativo desde un único panel
                    inteligente.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  🛡️
                </div>

                <div>
                  <p className="font-semibold uppercase text-sm text-white">
                    Cifrado seguro
                  </p>

                  <p className="text-sm opacity-80 text-white">
                    Arquitectura pensada para proteger la información más
                    valiosa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="border-t border-white/20 pt-6">
              <p className="text-xs uppercase tracking-widest mb-4 text-white">
                Únete a la red de talleres
              </p>

              <div className="flex gap-2 mb-4 text-white">
                {["A", "B", "C", "D", "E"].map((l) => (
                  <div
                    key={l}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm"
                  >
                    {l}
                  </div>
                ))}
              </div>

              <p className="text-xs opacity-70 italic text-white">
                “Eficiencia operativa real desde el primer día”
              </p>
            </div>
          </div>
        </div>

        <div className="p-12 text-white">
          <h2 className="text-3xl font-bold">Registro de Superadmin</h2>

          <p className="text-xs uppercase tracking-widest text-white/50 mt-1 mb-8">
            Configuración inicial del sistema
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6">
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {registerFields.map((field) => (
              <div key={field.name} className={field.colSpan}>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                  {...register(field.name, {
                    required: field.requiredMessage,
                  })}
                />

                {errors[field.name] && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors[field.name].message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                Contraseña maestra
              </label>

              <input
                type="password"
                placeholder="********"
                className="w-full rounded-xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                {...register("password", {
                  required: "Contraseña obligatoria",
                  minLength: {
                    value: 8,
                    message: "Mínimo 8 caracteres",
                  },
                })}
              />

              {errors.password && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                Confirmar clave
              </label>

              <input
                type="password"
                placeholder="********"
                className="w-full rounded-xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                {...register("confirmPassword", {
                  validate: (v) =>
                    v === passwordValue || "Las contraseñas no coinciden",
                })}
              />

              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 mt-4">
              <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition">
                Activar sistema Mechanic Manager →
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-white/50 hover:text-white transition"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}