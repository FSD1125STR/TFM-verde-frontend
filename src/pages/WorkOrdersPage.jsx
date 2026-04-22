import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Icon from '../components/ui/Icon.jsx';
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
      signatureUrl: vehicle.customer_signature?.url || '',
    };
  });
}

function sanitizePdfText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function padText(value, length) {
  return String(value ?? '').slice(0, length).padEnd(length, ' ');
}

function buildPdfPages({ title, subtitle, rows }) {
  const header = [
    sanitizePdfText(title),
    sanitizePdfText(subtitle),
    `Generado el ${sanitizePdfText(formatDate(new Date()))}`,
    '',
    `${padText('ORDEN', 12)} ${padText('FECHA', 12)} ${padText('MATRICULA', 12)} ${padText('VEHICULO', 24)} ${padText('CLIENTE', 24)} ${padText('MECANICO', 22)} ${padText('ESTADO', 12)}`,
    ''.padEnd(128, '-'),
  ];

  const body = rows.map((row) =>
    [
      padText(sanitizePdfText(row.orden), 12),
      padText(sanitizePdfText(row.fecha), 12),
      padText(sanitizePdfText(row.matricula), 12),
      padText(sanitizePdfText(row.vehiculo), 24),
      padText(sanitizePdfText(row.cliente), 24),
      padText(sanitizePdfText(row.mecanico), 22),
      padText(sanitizePdfText(row.estado), 12),
    ].join(' '),
  );

  const linesPerPage = 28;
  const pages = [];

  for (let index = 0; index < body.length || index === 0; index += linesPerPage) {
    pages.push([...header, ...body.slice(index, index + linesPerPage)]);
  }

  return pages;
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function buildSignatureImage(signatureUrl) {
  if (!signatureUrl) return null;

  const image = new Image();
  image.crossOrigin = 'anonymous';

  const loadedImage = await new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la firma para el PDF.'));
    image.src = signatureUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = loadedImage.naturalWidth;
  canvas.height = loadedImage.naturalHeight;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(loadedImage, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const base64 = dataUrl.split(',')[1];

  return {
    bytes: base64ToUint8Array(base64),
    width: canvas.width,
    height: canvas.height,
  };
}

async function createPdfBlob({ title, subtitle, rows, signatureUrl = '' }) {
  const pages = buildPdfPages({ title, subtitle, rows });
  const pageWidth = 842;
  const pageHeight = 595;
  const objects = [];
  const pageObjectNumbers = [];
  const signatureImage = rows.length === 1 ? await buildSignatureImage(signatureUrl) : null;
  const encoder = new TextEncoder();

  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogObjectNumber = addObject('');
  const pagesObjectNumber = addObject('');
  const fontObjectNumber = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  const signatureImageObjectNumber = signatureImage
    ? addObject(
        new Uint8Array([
          ...encoder.encode(
            `<< /Type /XObject /Subtype /Image /Width ${signatureImage.width} /Height ${signatureImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${signatureImage.bytes.length} >>\nstream\n`,
          ),
          ...signatureImage.bytes,
          ...encoder.encode('\nendstream'),
        ]),
      )
    : null;

  pages.forEach((pageLines, pageIndex) => {
    const textCommands = [];
    let y = 555;

    pageLines.forEach((line, index) => {
      const fontSize = index === 0 ? 18 : index < 3 ? 11 : 9;
      textCommands.push(`BT /F1 ${fontSize} Tf 36 ${y} Td (${line}) Tj ET`);
      y -= index < 3 ? 18 : 16;
    });

    if (signatureImage && pageIndex === 0) {
      const boxWidth = 220;
      const boxHeight = 100;
      const scale = Math.min(boxWidth / signatureImage.width, boxHeight / signatureImage.height);
      const renderWidth = Math.round(signatureImage.width * scale);
      const renderHeight = Math.round(signatureImage.height * scale);
      const imageX = 36;
      const imageY = 70;
      const lineY = imageY - 6;

      textCommands.push(`BT /F1 11 Tf 36 175 Td (${sanitizePdfText('Firma del cliente')}) Tj ET`);
      textCommands.push(`${imageX} ${lineY} m ${imageX + boxWidth} ${lineY} l S`);
      textCommands.push(
        `q ${renderWidth} 0 0 ${renderHeight} ${imageX} ${imageY} cm /Im1 Do Q`,
      );
    }

    const stream = textCommands.join('\n');
    const contentObjectNumber = addObject(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    const resources = signatureImage && pageIndex === 0
      ? `<< /Font << /F1 ${fontObjectNumber} 0 R >> /XObject << /Im1 ${signatureImageObjectNumber} 0 R >> >>`
      : `<< /Font << /F1 ${fontObjectNumber} 0 R >> >>`;
    const pageObjectNumber = addObject(
      `<< /Type /Page /Parent ${pagesObjectNumber} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources ${resources} /Contents ${contentObjectNumber} 0 R >>`,
    );

    pageObjectNumbers.push(pageObjectNumber);
  });

  objects[catalogObjectNumber - 1] = `<< /Type /Catalog /Pages ${pagesObjectNumber} 0 R >>`;
  objects[pagesObjectNumber - 1] =
    `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] >>`;

  const chunks = [encoder.encode('%PDF-1.4\n')];
  const offsets = [0];
  let currentOffset = chunks[0].length;

  objects.forEach((object, index) => {
    const prefix = encoder.encode(`${index + 1} 0 obj\n`);
    const body = object instanceof Uint8Array ? object : encoder.encode(String(object));
    const suffix = encoder.encode('\nendobj\n');

    offsets.push(currentOffset);
    chunks.push(prefix, body, suffix);
    currentOffset += prefix.length + body.length + suffix.length;
  });

  const xrefOffset = currentOffset;
  chunks.push(encoder.encode(`xref\n0 ${objects.length + 1}\n`));
  chunks.push(encoder.encode('0000000000 65535 f \n'));
  currentOffset += encoder.encode(`xref\n0 ${objects.length + 1}\n`).length;
  currentOffset += encoder.encode('0000000000 65535 f \n').length;

  for (let index = 1; index <= objects.length; index += 1) {
    chunks.push(encoder.encode(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`));
  }

  chunks.push(
    encoder.encode(
      `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectNumber} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );

  return new Blob(chunks, { type: 'application/pdf' });
}

async function downloadPdfDocument({ title, subtitle, rows, filename, signatureUrl }) {
  const blob = await createPdfBlob({ title, subtitle, rows, signatureUrl });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function WorkOrderCard({ order, onDownloadPdf }) {
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
                  <Icon name='profile' className='h-4 w-4' />
                </span>
                <span className='truncate'>{order.customerName}</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300'>
                  <Icon name='wrench' className='h-4 w-4' />
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
            onClick={() => onDownloadPdf(order)}
            className='flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white'
            aria-label='Exportar orden en PDF'
            title='Exportar orden en PDF'
          >
            <Icon name='download' className='h-5 w-5' />
          </button>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white'
            aria-label='Mas opciones'
            title='Mas opciones'
          >
            <Icon name='more' className='h-5 w-5' />
          </button>
          <Link
            to='/vehicles'
            className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg transition hover:bg-blue-600 hover:text-white'
            aria-label='Abrir vehiculo'
            title='Abrir vehiculo'
          >
            <Icon name='arrowRight' className='h-5 w-5' />
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

  const mapOrderToPdfRow = (order) => ({
    orden: order.orderNumber,
    fecha: formatDate(order.date),
    matricula: order.plate,
    vehiculo: order.vehicleName,
    cliente: order.customerName,
    mecanico: order.mechanicName,
    estado: order.status,
  });

  const handleExportOrderPdf = async (order) => {
    try {
      await downloadPdfDocument({
        title: `Orden de trabajo ${order.orderNumber}`,
        subtitle: 'Exportación individual en PDF de la orden seleccionada.',
        rows: [mapOrderToPdfRow(order)],
        filename: `${order.orderNumber.toLowerCase()}.pdf`,
        signatureUrl: order.signatureUrl,
      });
    } catch (downloadError) {
      setError(downloadError.message);
    }
  };

  const handleExport = async () => {
    try {
      await downloadPdfDocument({
        title: 'Órdenes de trabajo',
        subtitle: 'Listado filtrado de órdenes de trabajo exportado en PDF.',
        rows: filteredOrders.map(mapOrderToPdfRow),
        filename: 'ordenes-trabajo.pdf',
      });
    } catch (downloadError) {
      setError(downloadError.message);
    }
  };

  return (
    <section className='w-full space-y-6 text-white'>
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
          filteredOrders.map((order) => (
            <WorkOrderCard
              key={order.id}
              order={order}
              onDownloadPdf={handleExportOrderPdf}
            />
          ))
        ) : (
          <Card className='p-10 text-center text-white/50'>
            No hay ordenes de trabajo para los filtros seleccionados.
          </Card>
        )}
      </div>
    </section>
  );
}
