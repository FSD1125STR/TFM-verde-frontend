import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientInfoPage() {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dni, setDni] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    return (
        <div className="w-full space-y-8 text-white">
        <div>
            <h1 className="text-3xl font-bold">Recepción de Vehículo</h1>
            <p className="text-white/60">
            Completa el flujo para formalizar el ingreso al taller.
            </p>
        </div>

        <div className="flex w-full max-w-4xl flex-wrap items-center gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((step) => (
            <div
                key={step}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                step === 2
                    ? "bg-blue-600 text-white"
                    : step === 1
                    ? "bg-blue-600/80 text-white"
                    : "bg-[#1F2937] text-white/40"
                }`}
            >
                {step}
            </div>
            ))}
        </div>

        <div className="bg-[#111827] rounded-3xl p-5 shadow-xl space-y-8 sm:p-8">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                👤
            </div>
            <h2 className="text-sm font-bold tracking-widest text-white/80">
                INFORMACIÓN DEL CLIENTE
            </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2">
                Nombre
                </label>
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
                />
            </div>

            <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2">
                Apellidos
                </label>
                <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
                />
            </div>

            <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2">
                DNI / CIF
                </label>
                <input
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
                />
            </div>

            <div>
                <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2">
                Teléfono principal
                </label>
                <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2">
                Dirección de contacto
                </label>
                <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-[#1F2937] p-3 rounded-xl w-full outline-none"
                />
            </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
            <button
                onClick={() => navigate("/vehicle-reception")}
                className="px-6 py-3 rounded-xl text-white/60 hover:text-white"
            >
                Atrás
            </button>

            <button
                onClick={() => navigate("/vehicle-status")}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl"
            >
                Continuar →
            </button>
            </div>
        </div>
        </div>
    );
    }
