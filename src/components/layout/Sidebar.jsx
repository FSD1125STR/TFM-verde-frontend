import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginContext } from '../../contexts/AuthContext.js';
import { logout } from '../../services/LogoutApi.js';
import Icon from '../ui/Icon.jsx';

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile = () => {},
}) {
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
      onCloseMobile();
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

  const isDesktopCollapsed = isCollapsed && !isMobileOpen;
  const showCompactSidebar = isDesktopCollapsed;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#020617]/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onCloseMobile}
        aria-hidden='true'
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[86vw] max-w-72 flex-col justify-between border-r border-white/5 bg-[#0F172A] px-4 py-6 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:w-auto lg:max-w-none lg:translate-x-0 lg:shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${showCompactSidebar ? 'lg:w-24' : 'lg:w-72'}`}
      >
        <div>
        <div
          className={`mb-8 flex items-center ${
            showCompactSidebar ? 'lg:justify-center' : 'justify-between gap-3'
          }`}
        >
          <div className='flex min-w-0 items-center gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white'>
              <Icon name='wrench' className='h-6 w-6' />
            </div>

            {!showCompactSidebar ? (
              <div className='min-w-0'>
                <p className='truncate text-lg font-bold'>Mechanic Manager</p>
                <p className='text-sm text-white/60'>Taller Mecanico</p>
              </div>
            ) : null}
          </div>

          <div className='ml-auto flex items-start gap-2 self-start'>
            <button
              type='button'
              onClick={onCloseMobile}
              className='absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden'
              aria-label='Cerrar menu'
            >
              <Icon name='chevron' />
            </button>

          {!showCompactSidebar ? (
            <button
              type='button'
              onClick={() => setIsCollapsed(true)}
              className='hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white lg:flex'
              aria-label='Contraer barra lateral'
              title='Contraer'
            >
              <Icon name='chevron' />
            </button>
          ) : null}
          </div>
        </div>

        {showCompactSidebar ? (
          <button
            type='button'
            onClick={() => setIsCollapsed(false)}
            className='mb-5 hidden h-10 w-full items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white lg:flex'
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
                onClick={onCloseMobile}
                title={showCompactSidebar ? item.label : undefined}
                className={`flex items-center rounded-xl text-sm transition ${
                  showCompactSidebar
                    ? 'lg:justify-center lg:px-3 lg:py-3'
                    : 'gap-3 px-4 py-3'
                } ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon name={item.icon} className='h-5 w-5 shrink-0' />
                {!showCompactSidebar ? (
                  <span className='truncate font-medium'>{item.label}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        </div>

        <div className='space-y-4'>
        <div
          className={`rounded-xl bg-white/5 ${
            showCompactSidebar ? 'lg:flex lg:justify-center lg:p-3' : 'p-4'
          }`}
          title={showCompactSidebar ? `${userLabel} - ${roleLabel}` : undefined}
        >
          {showCompactSidebar ? (
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/70'>
              {String(userLabel).slice(0, 2)}
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase text-white/70'>
                {String(userLabel).slice(0, 2)}
              </div>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold'>{userLabel}</p>
                <p className='truncate text-xs text-white/60'>{roleLabel}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={showCompactSidebar ? 'Cerrar sesion' : undefined}
          className={`flex w-full items-center rounded-xl bg-red-500/15 text-red-400 transition hover:bg-red-500/25 ${
            showCompactSidebar
              ? 'lg:justify-center lg:px-3 lg:py-3'
              : 'gap-3 px-4 py-3'
          }`}
        >
          <Icon name='logout' />
          {!showCompactSidebar ? <span>Cerrar sesion</span> : null}
        </button>
        </div>
      </aside>
    </>
  );
}
