import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/AuthContext.js';
import { logout } from '../../services/LogoutApi.js';
import Icon from '../ui/Icon.jsx';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, setIsAuthenticated } = useContext(LoginContext);

  const menuItems = [
    { label: 'Panel Control', path: '/', icon: 'dashboard' },
    { label: 'Empleados', path: '/employees', icon: 'employees' },
    { label: 'Clientes', path: '/customers', icon: 'customers' },
    { label: 'Vehiculos', path: '/vehicles', icon: 'vehicles' },
    { label: 'Recepcion Vehiculo', path: '/vehicle-reception', icon: 'reception' },
    { label: 'Ordenes de Trabajo', path: '/work-orders', icon: 'orders' },
    { label: 'Chat', path: '/chat', icon: 'chat' },
    { label: 'Mi Perfil', path: '/profile', icon: 'profile' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  const roleLabel =
    profile?.employee?.rol?.name ||
    profile?.employee?.rol ||
    'Sin rol';

  const userLabel =
    profile?.employee?.name ||
    profile?.employee?.name_company ||
    profile?.employee?.email ||
    'Sesion iniciada';

  return (
    <aside
      className={`h-screen shrink-0 bg-[#0F172A] text-white flex flex-col justify-between border-r border-white/5 px-4 py-6 transition-[width] duration-300 ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div>
        <div
          className={`mb-8 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between gap-3'
          }`}
        >
          <div className='flex min-w-0 items-center gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white'>
              <Icon name='wrench' className='h-6 w-6' />
            </div>

            {!isCollapsed ? (
              <div className='min-w-0'>
                <p className='truncate text-lg font-bold'>Mechanic Manager</p>
                <p className='text-sm text-white/60'>Taller Mecanico</p>
              </div>
            ) : null}
          </div>

          {!isCollapsed ? (
            <button
              type='button'
              onClick={() => setIsCollapsed(true)}
              className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white'
              aria-label='Contraer barra lateral'
              title='Contraer'
            >
              <Icon name='chevron' />
            </button>
          ) : null}
        </div>

        {isCollapsed ? (
          <button
            type='button'
            onClick={() => setIsCollapsed(false)}
            className='mb-5 flex h-10 w-full items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white'
            aria-label='Abrir barra lateral'
            title='Abrir menu'
          >
            <Icon name='chevron' className='h-5 w-5 rotate-180' />
          </button>
        ) : null}

        <nav className='space-y-2'>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-sm transition ${
                  isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
                } ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon name={item.icon} />
                {!isCollapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className='space-y-4'>
        <div
          className={`rounded-xl bg-white/5 ${
            isCollapsed ? 'flex justify-center p-3' : 'p-4'
          }`}
          title={isCollapsed ? `${userLabel} - ${roleLabel}` : undefined}
        >
          {isCollapsed ? (
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/70'>
              {String(userLabel).slice(0, 2)}
            </div>
          ) : (
            <>
              <p className='truncate text-sm font-semibold'>{userLabel}</p>
              <p className='text-xs text-white/60'>{roleLabel}</p>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Cerrar sesion' : undefined}
          className={`flex w-full items-center rounded-xl bg-red-500/15 text-red-400 transition hover:bg-red-500/25 ${
            isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'
          }`}
        >
          <Icon name='logout' />
          {!isCollapsed ? <span>Cerrar sesion</span> : null}
        </button>
      </div>
    </aside>
  );
}
