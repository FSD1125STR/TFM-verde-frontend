import { useContext } from 'react';
import Icon from '../components/ui/Icon.jsx';
import { LoginContext } from '../contexts/AuthContext.js';

export default function ProfilePage() {
  const { profile, error, isAuthenticated } = useContext(LoginContext);
  const employee = profile?.employee;
  const displayName =
    employee?.type === 'COMPANY'
      ? employee?.name_company
      : [employee?.name, employee?.lastname].filter(Boolean).join(' ');

  return (
    <div className='w-full text-white'>
      <div className='w-full space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Mi Perfil</h1>
          <p className='text-white/60'>
            Información del usuario autenticado.
          </p>
        </div>

        {error ? (
          <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400'>
            {error}
          </div>
        ) : null}

        {!isAuthenticated || !employee ? (
          <div className='rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl'>
            <div className='mb-6 flex items-center gap-4'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white'>
                <Icon name='profile' className='h-7 w-7' />
              </div>

              <div>
                <h2 className='text-2xl font-bold'>Perfil no disponible</h2>
                <p className='text-sm text-white/50'>
                  Todavía no hay una sesión iniciada.
                </p>
              </div>
            </div>

            <div className='rounded-2xl border border-white/5 bg-[#1F2937] p-4 text-white/60'>
              Cuando el login esté activo, esta página mostrará los datos reales
              del usuario.
            </div>
          </div>
        ) : (
          <div className='rounded-3xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl'>
            <div className='mb-8 flex items-center gap-4'>
              {employee.profile_image?.url ? (
                <img
                  src={employee.profile_image.url}
                  alt={displayName || employee.email}
                  className='h-14 w-14 rounded-2xl border border-white/10 object-cover'
                />
              ) : (
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white'>
                  <Icon name='profile' className='h-7 w-7' />
                </div>
              )}

              <div className='min-w-0'>
                <h2 className='truncate text-2xl font-bold'>
                  {displayName || employee.email}
                </h2>
                <p className='truncate text-sm text-white/50'>
                  {employee.email}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              <ProfileField label='ID' value={employee._id} />
              <ProfileField label='Email' value={employee.email} />
              <ProfileField label='Tipo' value={employee.type} />
              <ProfileField label='Rol' value={employee.rol || 'Sin rol'} />

              {employee.type === 'COMPANY' ? (
                <ProfileField label='CIF' value={employee.cif || 'Sin CIF'} />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className='rounded-2xl border border-white/5 bg-[#1F2937] p-4'>
      <p className='mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40'>
        {label}
      </p>
      <p className='break-all text-white'>{value}</p>
    </div>
  );
}
