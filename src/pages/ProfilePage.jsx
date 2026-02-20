import { useContext } from "react"
import { LoginContext } from "../contexts/LoginContext.jsx";


export default function ProfilePage() {
    const { profile, error } = useContext(LoginContext)



    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-3xl font-bold">Página de Perfil</h1>
            <p>Esta es la páginas del perfil del usuario. Página restringida</p>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {profile ? (
                <div className="min-w-md p-4 border rounded text-center">
                    <p>{profile.employee._id}</p>
                    <h1 className="text-2xl">{profile.employee.name_company}</h1>
                    <h2 className="text-xl font-semibold">{profile.employee.email}</h2>
                    <p>{profile.employee.cif}</p>
                    <p>{profile.employee.password}</p>
                </div>
            ) : (
                <p>No hay información de perfil disponible.</p>
            )}

        </div>
    )
}
