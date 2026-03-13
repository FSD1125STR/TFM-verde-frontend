import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerCompany } from "../services/RegisterApi.js";

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

<div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">

<div className="w-full max-w-6xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

{/* PANEL IZQUIERDO */}

<div className="bg-primary text-primary-content p-12 flex flex-col justify-between">

<div>

<div className="flex items-center gap-3 mb-8">

<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
🔧
</div>

<div>
<p className="font-bold text-lg text-white">Mechanic Manager</p>
<p className="text-sm opacity-80  text-white">Taller Mecánico</p>
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
Gestiona cada aspecto operativo desde un único panel inteligente.
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
Arquitectura pensada para proteger la información más valiosa.
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

{["A","B","C","D","E"].map((l) => (

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

{/* PANEL DERECHO */}

<div className="p-12">

<h2 className="text-3xl font-bold">
Registro de Superadmin
</h2>

<p className="text-xs uppercase tracking-widest opacity-60 mt-1 mb-8">
Configuración inicial del sistema
</p>

{error && (

<div className="alert alert-error mb-6">
<span>{error}</span>
</div>

)}

<form
onSubmit={handleSubmit(onSubmitHandler)}
className="grid grid-cols-1 md:grid-cols-2 gap-4"
>

{/* NOMBRE */}

<div className="md:col-span-2">

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Nombre comercial del taller
</span>
</label>

<input
type="text"
placeholder="Ej. Precision Motors SL"
className="input input-bordered w-full"
{...register("name",{required:"Nombre obligatorio"})}
/>

{errors.name && (
<p className="text-error text-sm">{errors.name.message}</p>
)}

</div>

{/* CIF */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Identificación fiscal
</span>
</label>

<input
type="text"
placeholder="B12345678"
className="input input-bordered w-full"
{...register("cif",{required:"CIF obligatorio"})}
/>

</div>

{/* POSTAL */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Código postal
</span>
</label>

<input
type="text"
placeholder="28001"
className="input input-bordered w-full"
{...register("postal_code",{required:"Código postal obligatorio"})}
/>

</div>

{/* DIRECCION */}

<div className="md:col-span-2">

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Dirección social
</span>
</label>

<input
type="text"
placeholder="Calle, número, oficina..."
className="input input-bordered w-full"
{...register("address",{required:"Dirección obligatoria"})}
/>

</div>

{/* PAIS */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
País
</span>
</label>

<input
type="text"
placeholder="España"
className="input input-bordered w-full"
{...register("country",{required:"País obligatorio"})}
/>

</div>

{/* CIUDAD */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Ciudad
</span>
</label>

<input
type="text"
placeholder="Madrid"
className="input input-bordered w-full"
{...register("city",{required:"Ciudad obligatoria"})}
/>

</div>

{/* PROVINCIA */}

<div className="md:col-span-2">

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Estado / Provincia
</span>
</label>

<input
type="text"
placeholder="Madrid"
className="input input-bordered w-full"
{...register("state",{required:"Estado obligatorio"})}
/>

</div>

{/* EMAIL */}

<div className="md:col-span-2">

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Email de administrador
</span>
</label>

<input
type="email"
placeholder="admin@taller.com"
className="input input-bordered w-full"
{...register("email",{required:"Email obligatorio"})}
/>

</div>

{/* PASSWORD */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Contraseña maestra
</span>
</label>

<input
type="password"
placeholder="********"
className="input input-bordered w-full"
{...register("password",{
required:"Contraseña obligatoria",
minLength:{value:8,message:"Mínimo 8 caracteres"}
})}
/>

</div>

{/* CONFIRM */}

<div>

<label className="label">
<span className="label-text text-xs uppercase font-semibold">
Confirmar clave
</span>
</label>

<input
type="password"
placeholder="********"
className="input input-bordered w-full"
{...register("confirmPassword",{
validate:(v)=>v===passwordValue||"Las contraseñas no coinciden"
})}
/>

</div>

{/* BOTON */}

<div className="md:col-span-2 mt-4">

<button className="btn btn-primary w-full text-base text-white rounded-xl">
Activar sistema Mechanic Manager →
</button>

</div>

</form>

<div className="text-center mt-6">

<button
onClick={()=>navigate("/login")}
className="link text-sm opacity-60"
>
Volver al inicio de sesión
</button>

</div>

</div>

</div>

</div>

  );
}