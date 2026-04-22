import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../contexts/AuthContext.js';
import { login } from '../services/LoginApi.js';
import Icon from '../components/ui/Icon.jsx';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { setIsAuthenticated, getEmployeeProfile } = useContext(LoginContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmitHandler = async (data) => {
    setError('');

    try {
      await login(data.email, data.password);
      setIsAuthenticated(true);
      await getEmployeeProfile();
      navigate('/profile');
    } catch (error) {
      console.error('Error', error.message);
      setIsAuthenticated(false);
      setError(error.message);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#0B1120] px-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl'>
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white'>
              <Icon name='wrench' className='h-7 w-7' />
            </div>

            <h1 className='text-3xl font-bold text-white'>Mechanic Manager</h1>
            <p className='mt-2 text-sm text-white/50'>
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmitHandler)} className='space-y-5'>
            {error ? (
              <div className='rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
                {error}
              </div>
            ) : null}

            <div>
              <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Email
              </label>

              <input
                type='email'
                placeholder='correo@empresa.com'
                className='w-full rounded-2xl border border-white/5 bg-[#1F2937] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500'
                {...register('email', {
                  required: 'Email obligatorio',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Email no valido',
                  },
                })}
              />

              {errors.email ? (
                <p className='mt-2 text-xs text-red-400'>
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Contraseña
              </label>

              <input
                type='password'
                placeholder='********'
                className='w-full rounded-2xl border border-white/5 bg-[#1F2937] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-blue-500'
                {...register('password', {
                  required: 'Contraseña obligatoria',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres',
                  },
                })}
              />

              {errors.password ? (
                <p className='mt-2 text-xs text-red-400'>
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type='submit'
              className='w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700'
            >
              Iniciar sesión
            </button>
          </form>
        </div>

        <p className='mt-6 text-center text-xs text-white/30'>
          © {new Date().getFullYear()} Mechanic Manager
        </p>
      </div>
    </div>
  );
}
