import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { getCustomers } from '../services/customerApi.js';
import { getEmployees } from '../services/employeeApi.js';
import { getVehicles } from '../services/vehicleApi.js';

function getCustomerDisplayName(customer) {
  if (!customer) return 'Cliente sin asignar';
  if (customer.displayName) return customer.displayName;
  if (customer.company_name) return customer.company_name;

  return [customer.name, customer.lastname].filter(Boolean).join(' ') || 'Cliente';
}

function getVehicleDate(vehicle) {
  return new Date(vehicle.createdAt || vehicle.modifiedAt || Date.now());
}

function formatRelativeDate(date) {
  const diffInHours = Math.max(1, Math.round((Date.now() - date.getTime()) / 3600000));

  if (diffInHours < 24) return `Hace ${diffInHours} h`;

  const diffInDays = Math.round(diffInHours / 24);
  return `Hace ${diffInDays} d`;
}

function getInitials(label) {
  return label
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function DashboardStat({ label, value, helper, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    slate: 'bg-white/10 text-white/70 border-white/10',
  };

  return (
    <Card className='p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
            {label}
          </p>
          <p className='mt-4 text-4xl font-bold leading-none text-white'>{value}</p>
        </div>

        <span className={`rounded-xl border px-3 py-2 text-xs font-bold ${tones[tone]}`}>
          {helper}
        </span>
      </div>
    </Card>
  );
}

function EmptyState({ children }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/50'>
      {children}
    </div>
  );
}

export default function HomePage() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [vehiclesData, customersData, employeesData] = await Promise.all([
          getVehicles(),
          getCustomers(),
          getEmployees(),
        ]);

        setVehicles(vehiclesData);
        setCustomers(customersData);
        setEmployees(employeesData);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const vehiclesToday = vehicles.filter((vehicle) => {
      const vehicleDate = getVehicleDate(vehicle);
      return vehicleDate >= startOfToday;
    });

    const vehiclesWithPendingEvidence = vehicles.filter(
      (vehicle) =>
        !vehicle.customer_signature?.url ||
        !Array.isArray(vehicle.reception_images) ||
        vehicle.reception_images.length === 0,
    );

    const mechanics = employees.filter((employee) =>
      String(employee.rol || '').toLowerCase().includes('mec'),
    );

    const recentVehicles = [...vehicles]
      .sort((first, second) => getVehicleDate(second) - getVehicleDate(first))
      .slice(0, 5);

    const criticalItems = vehiclesWithPendingEvidence.slice(0, 4);

    return {
      vehiclesToday,
      vehiclesWithPendingEvidence,
      mechanics,
      recentVehicles,
      criticalItems,
    };
  }, [employees, vehicles]);

  const quickActions = [
    {
      title: 'Nueva recepcion',
      description: 'Registrar entrada de vehiculo',
      path: '/vehicle-reception',
      accent: 'bg-blue-500/15 text-blue-300',
    },
    {
      title: 'Ver vehiculos',
      description: 'Consultar evidencias y firmas',
      path: '/vehicles',
      accent: 'bg-emerald-500/15 text-emerald-300',
    },
    {
      title: 'Clientes',
      description: 'Abrir cartera de clientes',
      path: '/customers',
      accent: 'bg-amber-500/15 text-amber-300',
    },
  ];

  return (
    <section className='w-full space-y-6 text-white'>
      <PageHeader
        title='Panel de Control'
        description='Resumen operativo del taller y accesos principales.'
      />

      {error ? (
        <Card className='border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200'>
          {error}
        </Card>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <DashboardStat
          label='Vehiculos hoy'
          value={isLoading ? '...' : dashboardData.vehiclesToday.length}
          helper='Hoy'
        />
        <DashboardStat
          label='Vehiculos activos'
          value={isLoading ? '...' : vehicles.length}
          helper='Total'
          tone='emerald'
        />
        <DashboardStat
          label='Pendiente evidencias'
          value={isLoading ? '...' : dashboardData.vehiclesWithPendingEvidence.length}
          helper='Revision'
          tone='amber'
        />
        <DashboardStat
          label='Equipo'
          value={isLoading ? '...' : employees.length}
          helper={`${dashboardData.mechanics.length} mecanicos`}
          tone='slate'
        />
      </div>

      <div className='grid gap-6 xl:grid-cols-[1.35fr_0.9fr]'>
        <Card className='p-5'>
          <div className='mb-5 flex items-center justify-between gap-4'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Actividad reciente
              </p>
              <p className='mt-1 text-sm text-white/50'>
                Ultimos vehiculos registrados en recepcion.
              </p>
            </div>
            <Link to='/vehicles' className='text-sm font-semibold text-blue-300 hover:text-blue-200'>
              Ver todo
            </Link>
          </div>

          <div className='space-y-3'>
            {isLoading ? (
              <EmptyState>Cargando actividad...</EmptyState>
            ) : dashboardData.recentVehicles.length > 0 ? (
              dashboardData.recentVehicles.map((vehicle) => {
                const customerName = getCustomerDisplayName(vehicle.client_id);

                return (
                  <Link
                    key={vehicle._id}
                    to='/vehicles'
                    className='flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/40 hover:bg-white/[0.06]'
                  >
                    <div className='flex min-w-0 items-center gap-4'>
                      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 text-sm font-bold text-blue-200'>
                        {getInitials(vehicle.marca || vehicle.matricula || 'V')}
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate font-semibold text-white'>
                          {vehicle.marca} {vehicle.modelo}
                        </p>
                        <p className='truncate text-sm text-white/50'>
                          {vehicle.matricula} - {customerName}
                        </p>
                      </div>
                    </div>
                    <span className='shrink-0 text-xs font-semibold uppercase tracking-widest text-white/35'>
                      {formatRelativeDate(getVehicleDate(vehicle))}
                    </span>
                  </Link>
                );
              })
            ) : (
              <EmptyState>No hay actividad registrada.</EmptyState>
            )}
          </div>
        </Card>

        <Card className='p-5'>
          <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
            Accesos rapidos
          </p>
          <p className='mt-1 text-sm text-white/50'>
            Atajos para las tareas mas usadas del taller.
          </p>

          <div className='mt-5 space-y-3'>
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/40 hover:bg-white/[0.06]'
              >
                <div>
                  <p className='font-semibold text-white'>{action.title}</p>
                  <p className='text-sm text-white/50'>{action.description}</p>
                </div>
                <span className={`rounded-xl px-3 py-2 text-sm font-bold ${action.accent}`}>
                  Ir
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
        <Card className='p-5'>
          <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
            Estado de datos
          </p>
          <div className='mt-5 grid gap-3 sm:grid-cols-3'>
            <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='text-2xl font-bold'>{customers.length}</p>
              <p className='text-xs uppercase tracking-widest text-white/40'>Clientes</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='text-2xl font-bold'>{vehicles.length}</p>
              <p className='text-xs uppercase tracking-widest text-white/40'>Vehiculos</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='text-2xl font-bold'>{employees.length}</p>
              <p className='text-xs uppercase tracking-widest text-white/40'>Empleados</p>
            </div>
          </div>
        </Card>

        <Card className='p-5'>
          <div className='mb-5 flex items-center justify-between gap-4'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Alertas operativas
              </p>
              <p className='mt-1 text-sm text-white/50'>
                Vehiculos con firma o fotos de recepcion pendientes.
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            {isLoading ? (
              <EmptyState>Cargando alertas...</EmptyState>
            ) : dashboardData.criticalItems.length > 0 ? (
              dashboardData.criticalItems.map((vehicle) => (
                <Link
                  key={vehicle._id}
                  to='/vehicles'
                  className='flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-4 transition hover:bg-white/[0.07]'
                >
                  <div>
                    <p className='font-semibold text-white'>
                      Revisar {vehicle.matricula}
                    </p>
                    <p className='text-sm text-white/50'>
                      {vehicle.marca} {vehicle.modelo}
                    </p>
                  </div>
                  <span className='rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300'>
                    Pendiente
                  </span>
                </Link>
              ))
            ) : (
              <EmptyState>Todo al dia en evidencias y firmas.</EmptyState>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
