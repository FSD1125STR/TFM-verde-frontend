import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/AuthContext.js';
import { logout } from '../../services/LogoutApi.js';

function Icon({ name, className = 'h-5 w-5' }) {
  const iconProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const icons = {
    dashboard: (
      <svg {...iconProps}>
        <rect x='3' y='3' width='7' height='7' rx='1.5' />
        <rect x='14' y='3' width='7' height='7' rx='1.5' />
        <rect x='3' y='14' width='7' height='7' rx='1.5' />
        <rect x='14' y='14' width='7' height='7' rx='1.5' />
      </svg>
    ),
    employees: (
      <svg {...iconProps}>
        <path d='M16 19c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4' />
        <circle cx='9.5' cy='8' r='3' />
        <path d='M21 19c0-1.9-1.2-3.4-3-3.8' />
        <path d='M16.5 5.2a3 3 0 0 1 0 5.6' />
      </svg>
    ),
    customers: (
      <svg {...iconProps}>
        <path d='M4 20V6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8V20' />
        <path d='M8 20v-5h8v5' />
        <path d='M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01' />
      </svg>
    ),
    vehicles: (
      <svg {...iconProps}>
        <path d='M5 16h14l-1.4-5.2A2.5 2.5 0 0 0 15.2 9H8.8a2.5 2.5 0 0 0-2.4 1.8L5 16Z' />
        <path d='M7 16v2M17 16v2M6.5 13h.01M17.5 13h.01' />
        <path d='M8 9l1-3h6l1 3' />
      </svg>
    ),
    reception: (
      <svg {...iconProps}>
        <path d='M4 17V7a2 2 0 0 1 2-2h8l6 6v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z' />
        <path d='M14 5v6h6' />
        <path d='M8 14h5M8 10h2' />
      </svg>
    ),
    orders: (
      <svg {...iconProps}>
        <path d='M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V6a2 2 0 0 1 2-2Z' />
        <path d='M8 9h8M8 13h6' />
      </svg>
    ),
    chat: (
      <svg {...iconProps}>
        <path d='M21 12a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.6-4.4A7.5 7.5 0 1 1 21 12Z' />
        <path d='M8 11h8M8 15h5' />
      </svg>
    ),
    profile: (
      <svg {...iconProps}>
        <circle cx='12' cy='8' r='4' />
        <path d='M4 21a8 8 0 0 1 16 0' />
      </svg>
    ),
    wrench: (
      <svg {...iconProps}>
        <path d='M14.7 6.3a5 5 0 0 0-6 6L4 17l3 3 4.7-4.7a5 5 0 0 0 6-6l-3.2 3.2-3-1 1-3 3.2-3.2Z' />
      </svg>
    ),
    logout: (
      <svg {...iconProps}>
        <path d='M10 17l5-5-5-5' />
        <path d='M15 12H3' />
        <path d='M21 5v14' />
      </svg>
    ),
    chevron: (
      <svg {...iconProps}>
        <path d='M15 18 9 12l6-6' />
      </svg>
    ),
  };

  return icons[name] ?? icons.dashboard;
}

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
