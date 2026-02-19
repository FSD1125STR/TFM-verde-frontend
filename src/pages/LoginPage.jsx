import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { login } from '../services/LoginApi.js'

export default function LoginPage() {

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmitHandler = async (data) => {
        setError('');
        try {
            const responseData = await login(data.email, data.password);
            console.log('Login successful:', responseData);
            navigate('/profile');


        } catch (error) {
            console.error('Error', error.message);
            setError(error.message);
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Login</h1>
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <input
                        type="email"
                        className="input"
                        placeholder="email"
                        {...register('email', {
                            required: 'Email required',
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {errors.email && <p className="label">{errors.email.message}</p>}
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Contraseña</legend>
                    <input
                        type="password"
                        className="input"
                        placeholder="Contraseña"
                        {...register('password', {
                            required: 'Password required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            }
                        })}
                    />
                    {errors.password && <p className="label">{errors.password.message}</p>}
                </fieldset>

                <button className="btn btn-primary mt-2">login</button>
            </form>
        </div>
    )
}
