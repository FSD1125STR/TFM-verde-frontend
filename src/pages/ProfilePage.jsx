import { useContext } from "react";
import { LoginContext } from "../contexts/AuthContext.js";

export default function ProfilePage() {
  const { profile, error, isAuthenticated } = useContext(LoginContext);

  return (
    <div className="min-h-screen bg-[#0B1120] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-white/60">
            Información del usuario autenticado.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {!isAuthenticated || !profile || !profile.employee ? (
          <div className="rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">
                👤
              </div>

              <div>
                <h2 className="text-2xl font-bold">Perfil no disponible</h2>
                <p className="text-white/50 text-sm">
                  Todavía no hay una sesión iniciada.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#1F2937] border border-white/5 p-4 text-white/60">
              Cuando tengáis el login funcionando, esta página podrá mostrar los datos reales del usuario.
            </div>
          </div>
        ) : (
          (() => {
            const { _id, email, cif, type } = profile.employee;

            const displayName =
              type === "COMPANY"
                ? profile.employee.name_company
                : profile.employee.name;

            return (
              <div className="rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  {profile.employee.profile_image?.url ? (
                    <img
                      src={profile.employee.profile_image.url}
                      alt={displayName}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <p className="text-white/50 text-sm">{email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl bg-[#1F2937] border border-white/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
                      ID
                    </p>
                    <p className="text-white break-all">{_id}</p>
                  </div>

                  <div className="rounded-2xl bg-[#1F2937] border border-white/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
                      Email
                    </p>
                    <p className="text-white break-all">{email}</p>
                  </div>

                  <div className="rounded-2xl bg-[#1F2937] border border-white/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
                      Tipo
                    </p>
                    <p className="text-white">{type}</p>
                  </div>

                  {type === "COMPANY" && (
                    <div className="rounded-2xl bg-[#1F2937] border border-white/5 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
                        CIF
                      </p>
                      <p className="text-white">{cif}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
