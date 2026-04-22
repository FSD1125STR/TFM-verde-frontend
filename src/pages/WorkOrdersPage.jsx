import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Select from '../components/ui/Select.jsx';
import { getEmployees } from '../services/employeeApi.js';
import { getVehicles } from '../services/vehicleApi.js';

const statusStyles = {
  'En proceso': 'border-blue-500/30 bg-blue-500/15 text-blue-300',
  Pendiente: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  Completada: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
};

function getCustomerName(customer) {
  if (!customer) return 'Cliente sin asignar';
  if (customer.displayName) return customer.displayName;
  if (customer.company_name) return customer.company_name;

  return [customer.name, customer.lastname].filter(Boolean).join(' ') || 'Cliente';
}

function getEmployeeName(employee) {
  if (!employee) return 'Sin mecanico asignado';

  return [employee.name, employee.lastname].filter(Boolean).join(' ') || employee.email;
}

function getOrderStatus(vehicle) {
  const hasPhotos = Array.isArray(vehicle.reception_images) && vehicle.reception_images.length > 0;
  const hasSignature = Boolean(vehicle.customer_signature?.url);

  if (hasPhotos && hasSignature) return 'Completada';
  if (hasPhotos || hasSignature || vehicle.observaciones) return 'En proceso';
  return 'Pendiente';
}

function getOrderDate(vehicle) {
  return new Date(vehicle.createdAt || vehicle.modifiedAt || Date.now());
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function buildOrderNumber(index) {
  return `ORD-${String(2841 + index).padStart(4, '0')}`;
}

function getPlateBlocks(plate) {
  const normalizedPlate = String(plate || '---').toUpperCase();
  const first = normalizedPlate.slice(0, 3) || '---';
  const second = normalizedPlate.slice(3) || '---';

  return { first, second };
}

function buildOrders(vehicles, employees) {
  const mechanics = employees.filter((employee) =>
    String(employee.rol || '').toLowerCase().includes('mec'),
  );

  return vehicles.map((vehicle, index) => {
    const mechanic = mechanics[index % Math.max(mechanics.length, 1)];

    return {
      id: vehicle._id,
      orderNumber: buildOrderNumber(index),
      date: getOrderDate(vehicle),
      plate: vehicle.matricula,
      vehicleName: `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim(),
      customerName: getCustomerName(vehicle.client_id),
      mechanicName: getEmployeeName(mechanic),
      status: getOrderStatus(vehicle),
      observations: vehicle.observaciones || 'Sin observaciones registradas',
    };
  });
}

function WorkOrderCard({ order }) {
  const plateBlocks = getPlateBlocks(order.plate);

  return (
    <Card className='p-5 transition hover:border-blue-500/30 hover:bg-white/[0.03]'>
      <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
        <div className='grid min-w-0 flex-1 gap-5 sm:grid-cols-[84px_1fr] lg:grid-cols-[84px_1fr_180px] lg:items-center'>
          <div className='space-y-4'>
            <div>
              <span className='inline-flex rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-300'>
                {order.orderNumber}
              </span>
              <p className='mt-2 text-xs font-bold uppercase tracking-widest text-white/35'>
                {formatDate(order.date)}
              </p>
            </div>

            <div className='inline-flex min-h-16 min-w-20 flex-col justify-center rounded-2xl bg-[#1B2538] px-4 py-3 font-bold text-white'>
              <span>{plateBlocks.first}</span>
              <span>{plateBlocks.second}</span>
            </div>
          </div>

          <div className='min-w-0 space-y-4'>
            <div>
              <p className='text-2xl font-bold leading-tight text-white/80'>
                {order.vehicleName || 'Vehiculo sin modelo'}
              </p>
              <p className='mt-1 text-sm text-white/45'>{order.observations}</p>
            </div>

            <div className='grid gap-3 text-sm text-white/65 sm:grid-cols-2'>
              <div className='flex items-center gap-3'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/45'>
                  CL
                </span>
                <span className='truncate'>{order.customerName}</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300'>
                  ME
                </span>
                <span className='truncate'>{order.mechanicName}</span>
              </div>
            </div>
          </div>

          <div className='flex lg:justify-center'>
            <span
              className={`inline-flex rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest ${statusStyles[order.status]}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 text-white/45'>
          <button
            type='button'
            className='h-10 w-10 rounded-xl transition hover:bg-white/10 hover:text-white'
            aria-label='Descargar orden'
          >
            DL
          </button>
          <button
            type='button'
            className='h-10 w-10 rounded-xl transition hover:bg-white/10 hover:text-white'
            aria-label='Mas opciones'
          >
            ...
          </button>
          <Link
            to='/vehicles'
            className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg transition hover:bg-blue-600 hover:text-white'
            aria-label='Abrir vehiculo'
          >
            &gt;
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default function WorkOrdersPage() {
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [vehiclesData, employeesData] = await Promise.all([
          getVehicles(),
          getEmployees(),
        ]);

        setVehicles(vehiclesData);
        setEmployees(employeesData);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const orders = useMemo(() => buildOrders(vehicles, employees), [vehicles, employees]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;

      const searchableText = [
        order.orderNumber,
        order.plate,
        order.vehicleName,
        order.customerName,
        order.mechanicName,
      ]
        .join(' ')
        .toLowerCase();

      return matchesStatus && searchableText.includes(normalizedSearch);
    });
  }, [orders, search, statusFilter]);

  const handleExport = () => {
    const rows = filteredOrders.map((order) => ({
      orden: order.orderNumber,
      fecha: formatDate(order.date),
      matricula: order.plate,
      vehiculo: order.vehicleName,
      cliente: order.customerName,
      mecanico: order.mechanicName,
      estado: order.status,
    }));

    const csvHeader = Object.keys(rows[0] || {
      orden: '',
      fecha: '',
      matricula: '',
      vehiculo: '',
      cliente: '',
      mecanico: '',
      estado: '',
    });

    const csvRows = [
      csvHeader.join(','),
      ...rows.map((row) =>
        csvHeader
          .map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`)
          .join(','),
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'ordenes-trabajo.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className='max-w-7xl space-y-6 text-white'>
      <PageHeader
        title='Ordenes de Trabajo'
        description='Consulta el estado de los trabajos abiertos y recientes del taller.'
      />

      <Card className='p-4'>
        {error ? <p className='mb-4 text-sm text-red-400'>{error}</p> : null}

        <div className='grid gap-3 lg:grid-cols-[1fr_180px_150px] lg:items-end'>
          <Input
            label='Buscar'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar por orden, matricula, cliente o mecanico...'
            className='border-white/10 bg-[#111827]'
          />

          <Select
            label='Estado'
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'Todos', label: 'Todos' },
              { value: 'En proceso', label: 'En proceso' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'Completada', label: 'Completada' },
            ]}
            className='border-white/10 bg-[#111827]'
          />

          <Button onClick={handleExport} className='h-[50px] uppercase tracking-widest'>
            Exportar
          </Button>
        </div>
      </Card>

      <div className='space-y-4'>
        {isLoading ? (
          <Card className='p-10 text-center text-white/50'>
            Cargando ordenes de trabajo...
          </Card>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <WorkOrderCard key={order.id} order={order} />)
        ) : (
          <Card className='p-10 text-center text-white/50'>
            No hay ordenes de trabajo para los filtros seleccionados.
          </Card>
        )}
      </div>
    </section>
  );
}
