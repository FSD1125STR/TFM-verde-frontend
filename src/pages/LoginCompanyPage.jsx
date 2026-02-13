import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginCompany } from "../services/LoginCompanyApi.js";
import { useNavigate } from "react-router-dom";


export default function LoginCompanyPage() {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: "onSubmit",
        reValidateMode: "onChange", // después de submit, si corrige, se actualiza
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => {
            setError('');
        }, 3000);

        return () => clearTimeout(timer);
    }, [error]);



    const onSubmitHandler = async (data) => {
        setError('');
        try {
            const response = await loginCompany(data.email, data.password);
            console.log('Login successful:', response);
            navigate('/'); // Redirige a la página de inicio después del login exitoso

        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message);
        }
    };

    return (
        <div className="justify-center items-center flex flex-col gap-10 h-[calc(100vh-104px)] px-4">
            <h1 className="font-bold text-3xl">Login Company</h1>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleSubmit(onSubmitHandler)} className="w-full max-w-sm" action="">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <input
                        className="input w-full"
                        type="text"
                        placeholder="Email..."
                        {...register('email', {
                            required: 'Email requerido',
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Email no es válido'
                            }
                        })
                        }
                    />

                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    {/* <p className="label">Optional</p> */}
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Password</legend>
                    <input
                        className="input w-full"
                        type="password"
                        placeholder="Password..."
                        {...register('password', {
                            required: 'Password es requerido',
                            minLength: {
                                value: 8,
                                message: 'La contraseña debe tener al menos 8 caracteres'
                            }
                        })
                        }
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </fieldset>

                <button className="btn btn-primary my-4 w-full">Login</button>

            </form>
        </div>
    );
}


