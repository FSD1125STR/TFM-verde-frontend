import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Icon from '../ui/Icon.jsx';

export default function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-[#0B1120] text-white lg:flex'>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className='flex min-h-screen flex-1 flex-col'>
        <header className='sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#0B1120]/95 px-4 py-4 backdrop-blur lg:hidden'>
          <div>
            <p className='text-lg font-bold text-white'>Mechanic Manager</p>
            <p className='text-xs uppercase tracking-[0.24em] text-white/40'>
              Taller mecanico
            </p>
          </div>

          <button
            type='button'
            onClick={() => setIsMobileSidebarOpen(true)}
            className='flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10'
            aria-label='Abrir menu de navegacion'
          >
            <Icon name='menu' />
          </button>
        </header>

        <main className='flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10'>
          <div className='mx-auto w-full max-w-[1800px]'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
