import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../services/LoginApi.js";
import { LoginContext } from "../contexts/AuthContext.js";

export default function LoginPage() {
    const [error, setError] = useState("");
    const { setIsAuthenticated, getEmployeeProfile } = useContext(LoginContext);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmitHandler = async (data) => {
        setError("");

        try {
        await login(data.email, data.password);
        setIsAuthenticated(true);
        await getEmployeeProfile();
        navigate("/profile");
        } catch (error) {
        console.error("Error", error.message);
        setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
            <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl">
                🔧
                </div>

                <h1 className="text-3xl font-bold text-white">
                Mechanic Manager
                </h1>

                <p className="text-white/50 text-sm mt-2">
                Inicia sesión para continuar
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-5">
                {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                    {error}
                </div>
                )}

                <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Email
                </label>

                <input
                    type="email"
                    placeholder="correo@empresa.com"
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                    {...register("email", {
                    required: "Email required",
                    pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                    },
                    })}
                />

                {errors.email && (
                    <p className="text-red-400 text-xs mt-2">
                    {errors.email.message}
                    </p>
                )}
                </div>

                <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Contraseña
                </label>

                <input
                    type="password"
                    placeholder="********"
                    className="w-full rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white placeholder:text-white/30 focus:border-blue-500"
                    {...register("password", {
                    required: "Password required",
                    minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                    },
                    })}
                />

                {errors.password && (
                    <p className="text-red-400 text-xs mt-2">
                    {errors.password.message}
                    </p>
                )}
                </div>

                <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition"
                >
                Iniciar sesión
                </button>
            </form>
            </div>

            <p className="text-center text-white/30 text-xs mt-6">
            © {new Date().getFullYear()} Mechanic Manager
            </p>
        </div>
        </div>
    );
}