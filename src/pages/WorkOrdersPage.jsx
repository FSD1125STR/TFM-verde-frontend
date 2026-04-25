import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Icon from '../components/ui/Icon.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Select from '../components/ui/Select.jsx';
import { LoginContext } from '../contexts/AuthContext.js';
import { deleteImage, uploadImage } from '../services/cloudinary.js';
import { getCustomers } from '../services/customerApi.js';
import { getEmployees } from '../services/employeeApi.js';
import {
  getVehicleById,
  getVehicles,
  sendWorkOrderEmail,
  updateVehicle,
} from '../services/vehicleApi.js';

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
  if (vehicle.work_order_status) return vehicle.work_order_status;

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

function formatPlate(plate) {
  return String(plate || '---').toUpperCase();
}

function getFuelLabel(level) {
  return ['Vacio', '1/4', '1/2', '3/4', 'Lleno'][level] ?? '-';
}

function normalizeAsset(asset) {
  if (!asset || typeof asset !== 'object') return null;

  if (asset.public_id && asset.url) {
    return {
      public_id: asset.public_id,
      url: asset.url,
    };
  }

  if (asset.type?.public_id && asset.type?.url) {
    return {
      public_id: asset.type.public_id,
      url: asset.type.url,
    };
  }

  return null;
}

function normalizeAssetList(assets) {
  if (!Array.isArray(assets)) return [];

  return assets.map(normalizeAsset).filter(Boolean);
}

function normalizeVehicleMedia(vehicle) {
  if (!vehicle || typeof vehicle !== 'object') return vehicle;

  return {
    ...vehicle,
    reception_images: normalizeAssetList(vehicle.reception_images),
    customer_signature: normalizeAsset(vehicle.customer_signature),
  };
}

function normalizeVehicleFormData(data) {
  return {
    client_id: data.client_id ?? '',
    matricula: (data.matricula ?? '').trim(),
    n_bastidor: (data.n_bastidor ?? '').trim(),
    marca: (data.marca ?? '').trim(),
    modelo: (data.modelo ?? '').trim(),
    tipo_combustible: (data.tipo_combustible ?? '').trim(),
    cantidad_combustible: String(data.cantidad_combustible ?? '0'),
    year: String(data.year ?? '').trim(),
    observaciones: (data.observaciones ?? '').trim(),
  };
}

const emptyVehicleFormData = {
  client_id: '',
  matricula: '',
  n_bastidor: '',
  marca: '',
  modelo: '',
  tipo_combustible: '',
  cantidad_combustible: '0',
  year: '',
  observaciones: '',
};

function buildOrders(vehicles, employees) {
  return vehicles.map((vehicle, index) => {
    return {
      id: vehicle._id,
      vehicleId: vehicle._id,
      orderNumber: buildOrderNumber(index),
      date: getOrderDate(vehicle),
      plate: vehicle.matricula,
      vehicleName: `${vehicle.marca || ''} ${vehicle.modelo || ''}`.trim(),
      customerName: getCustomerName(vehicle.client_id),
      customerEmail: vehicle.client_id?.email || '',
      assignedMechanicId: vehicle.assigned_mechanic?._id || '',
      mechanicName: getEmployeeName(vehicle.assigned_mechanic),
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

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

function WorkOrderCard({
  order,
  mechanicOptions,
  statusOptions,
  onAssignMechanic,
  onChangeStatus,
  onDownloadPdf,
  onSendEmail,
  onPreview,
  onOpenVehicle,
  isSendingEmail,
  isUpdatingMechanic,
  isUpdatingStatus,
}) {
  const formattedPlate = formatPlate(order.plate);
  const compactSelectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23cbd5e1' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 7 5 6 5-6'/%3E%3C/svg%3E")`,
    backgroundPosition: 'right 0.15rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '0.95rem',
    colorScheme: 'dark',
  };
  const compactOptionStyle = {
    backgroundColor: '#1B2538',
    color: '#F8FAFC',
  };

  return (
    <Card className='p-5 transition hover:border-blue-500/30 hover:bg-white/[0.03]'>
      <div className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
        <div className='grid min-w-0 flex-1 gap-6 md:grid-cols-[172px_1fr] xl:grid-cols-[172px_minmax(0,1fr)_240px] xl:items-stretch'>
          <div className='flex flex-col items-start gap-4 md:items-center xl:items-start'>
            <div className='w-full text-left md:text-center xl:text-left'>
              <span className='inline-flex rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-300'>
                {order.orderNumber}
              </span>
              <p className='mt-2 text-xs font-bold uppercase tracking-widest text-white/35'>
                {formatDate(order.date)}
              </p>
            </div>

            <div className='inline-flex min-h-16 w-full max-w-[156px] items-center justify-center self-start rounded-2xl bg-[#1B2538] px-4 py-3 font-bold text-white md:self-center xl:self-start'>
              <span className='truncate text-lg leading-none tracking-normal'>{formattedPlate}</span>
            </div>
          </div>

          <div className='min-w-0 space-y-5'>
            <div>
              <p className='text-2xl font-bold leading-tight text-white/80'>
                {order.vehicleName || 'Vehiculo sin modelo'}
              </p>
              <p className='mt-1 text-sm text-white/45'>{order.observations}</p>
            </div>

            <div className='grid gap-3 text-sm text-white/65'>
              <div className='flex items-center gap-3'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/45'>
                  <Icon name='profile' className='h-4 w-4' />
                </span>
                <span className='truncate'>{order.customerName}</span>
              </div>
            </div>
          </div>

          <div className='flex h-full flex-col justify-center space-y-4 xl:justify-self-end'>
            <div className='space-y-2'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                Mecánico
              </p>
              <div className='flex w-full min-w-[220px] items-center gap-3 rounded-2xl border border-white/10 bg-[#1B2538] px-3 py-2.5'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300'>
                  <Icon name='wrench' className='h-4 w-4' />
                </span>
                <select
                  value={order.assignedMechanicId}
                  onChange={(event) => onAssignMechanic(order, event.target.value)}
                  disabled={isUpdatingMechanic}
                  style={compactSelectStyle}
                  className='min-w-0 flex-1 appearance-none bg-transparent pr-8 text-sm font-medium text-white outline-none disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {mechanicOptions.map((option) => (
                    <option key={option.value} value={option.value} style={compactOptionStyle}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                Estado
              </p>
              <select
                value={order.status}
                onChange={(event) => onChangeStatus(order, event.target.value)}
                disabled={isUpdatingStatus}
                style={compactSelectStyle}
                className={`w-full min-w-[220px] appearance-none rounded-2xl border px-4 py-3 pr-10 text-sm font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusStyles[order.status]}`}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} style={compactOptionStyle}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 self-end text-white/45 xl:self-center'>
          <button
            type='button'
            onClick={() => onPreview(order)}
            className='flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10 hover:text-white'
            aria-label='Previsualizar orden'
            title='Previsualizar orden'
          >
            <Icon name='eye' className='h-5 w-5' />
          </button>
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
            onClick={() => onSendEmail(order)}
            disabled={!order.customerEmail || isSendingEmail}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              order.customerEmail && !isSendingEmail
                ? 'text-white/45 hover:bg-white/10 hover:text-white'
                : 'cursor-not-allowed text-white/20'
            }`}
            aria-label='Enviar orden por email'
            title={
              order.customerEmail
                ? 'Enviar orden por email'
                : 'El cliente no tiene email registrado'
            }
          >
            <Icon name='mail' className={isSendingEmail ? 'h-5 w-5 animate-pulse' : 'h-5 w-5'} />
          </button>
          <button
            type='button'
            onClick={() => onOpenVehicle(order.vehicleId)}
            className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg transition hover:bg-blue-600 hover:text-white'
            aria-label='Abrir vehiculo'
            title='Abrir vehiculo'
          >
            <Icon name='vehicles' className='h-5 w-5' />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function WorkOrdersPage() {
  const { profile } = useContext(LoginContext);
  const signatureCanvasRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sendingOrderId, setSendingOrderId] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [updatingStatusOrderId, setUpdatingStatusOrderId] = useState('');
  const [previewOrder, setPreviewOrder] = useState(null);
  const [selectedWorkOrderVehicle, setSelectedWorkOrderVehicle] = useState(null);
  const [vehicleModalSnapshot, setVehicleModalSnapshot] = useState(null);
  const [vehicleModalMode, setVehicleModalMode] = useState('view');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isLoadingVehicleDetail, setIsLoadingVehicleDetail] = useState(false);
  const [vehicleSubmitError, setVehicleSubmitError] = useState('');
  const [isVehicleSubmitting, setIsVehicleSubmitting] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState(emptyVehicleFormData);
  const [receptionImages, setReceptionImages] = useState([]);
  const [signatureImage, setSignatureImage] = useState(null);
  const [newReceptionFiles, setNewReceptionFiles] = useState([]);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [vehiclesData, employeesData, customersData] = await Promise.all([
          getVehicles(),
          getEmployees(),
          getCustomers(),
        ]);

        setVehicles(vehiclesData.map(normalizeVehicleMedia));
        setEmployees(employeesData);
        setCustomers(customersData);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, []);

  useEffect(() => {
    if (!isVehicleModalOpen) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isVehicleModalOpen]);

  const orders = useMemo(() => buildOrders(vehicles, employees), [vehicles, employees]);
  const isVehicleReadOnlyMode = vehicleModalMode === 'view';
  const mechanics = useMemo(
    () => employees.filter((employee) => String(employee.rol || '').toLowerCase().includes('mec')),
    [employees],
  );
  const mechanicOptions = useMemo(
    () => [
      { value: '', label: 'Sin mecanico asignado' },
      ...mechanics.map((employee) => ({
        value: employee._id,
        label: getEmployeeName(employee),
      })),
    ],
    [mechanics],
  );
  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En proceso', label: 'En proceso' },
    { value: 'Completada', label: 'Completada' },
  ];
  const formCustomerOptions = customers.map((customer) => ({
    value: customer._id,
    label: `${customer.displayName} - ${customer.identifier}`,
  }));

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

  const handleAssignMechanic = async (order, mechanicId) => {
    setError('');
    setUpdatingOrderId(order.id);

    try {
      const updatedVehicle = await updateVehicle(order.id, {
        assigned_mechanic: mechanicId || null,
      });

      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle._id === order.id ? updatedVehicle : vehicle)),
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleChangeStatus = async (order, status) => {
    setError('');
    setUpdatingStatusOrderId(order.id);

    try {
      const updatedVehicle = await updateVehicle(order.id, {
        work_order_status: status,
      });

      setVehicles((prev) =>
        prev.map((vehicle) => (vehicle._id === order.id ? updatedVehicle : vehicle)),
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingStatusOrderId('');
    }
  };

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

  const handleSendOrderEmail = async (order) => {
    if (!order.customerEmail) {
      setError('El cliente de esta orden no tiene email registrado');
      return;
    }

    setError('');
    setSendingOrderId(order.id);

    try {
      const blob = await createPdfBlob({
        title: `Orden de trabajo ${order.orderNumber}`,
        subtitle: 'Exportación individual en PDF de la orden seleccionada.',
        rows: [mapOrderToPdfRow(order)],
        signatureUrl: order.signatureUrl,
      });

      const pdfBase64 = await blobToBase64(blob);

      await sendWorkOrderEmail(order.id, {
        pdfBase64,
        filename: `${order.orderNumber.toLowerCase()}.pdf`,
        orderNumber: order.orderNumber,
      });
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSendingOrderId('');
    }
  };

  const openPreviewModal = (order) => {
    setPreviewOrder(order);
  };

  const closePreviewModal = () => {
    setPreviewOrder(null);
  };

  const hydrateVehicleModal = (vehicle) => {
    const normalizedVehicle = normalizeVehicleMedia(vehicle);

    setSelectedWorkOrderVehicle(normalizedVehicle);
    setVehicleFormData({
      client_id: normalizedVehicle.client_id?._id ?? '',
      matricula: normalizedVehicle.matricula ?? '',
      n_bastidor: normalizedVehicle.n_bastidor ?? '',
      marca: normalizedVehicle.marca ?? '',
      modelo: normalizedVehicle.modelo ?? '',
      tipo_combustible: normalizedVehicle.tipo_combustible ?? '',
      cantidad_combustible: String(normalizedVehicle.cantidad_combustible ?? 0),
      year: normalizedVehicle.year
        ? new Date(normalizedVehicle.year).getFullYear().toString()
        : '',
      observaciones: normalizedVehicle.observaciones ?? '',
    });
    setReceptionImages(normalizedVehicle.reception_images ?? []);
    setSignatureImage(normalizedVehicle.customer_signature ?? null);
    setNewReceptionFiles([]);
    setVehicleSubmitError('');
    setHasNewSignature(false);
    clearVehicleSignatureCanvas();
  };

  const openVehicleModal = async (vehicleId, mode = 'view') => {
    setVehicleModalMode(mode);
    setIsVehicleModalOpen(true);
    setVehicleSubmitError('');
    setIsLoadingVehicleDetail(true);

    const baseVehicle = vehicles.find((vehicle) => vehicle._id === vehicleId);
    if (baseVehicle) {
      const normalizedBaseVehicle = normalizeVehicleMedia(baseVehicle);
      setVehicleModalSnapshot(normalizedBaseVehicle);
      hydrateVehicleModal(normalizedBaseVehicle);
    }

    try {
      const vehicleDetail = await getVehicleById(vehicleId);
      const normalizedVehicleDetail = normalizeVehicleMedia(vehicleDetail);
      setVehicleModalSnapshot(normalizedVehicleDetail);
      hydrateVehicleModal(normalizedVehicleDetail);
    } catch (vehicleError) {
      setVehicleSubmitError(vehicleError.message);
    } finally {
      setIsLoadingVehicleDetail(false);
    }
  };

  const closeVehicleModal = () => {
    setSelectedWorkOrderVehicle(null);
    setVehicleModalSnapshot(null);
    setVehicleModalMode('view');
    setVehicleSubmitError('');
    setVehicleFormData(emptyVehicleFormData);
    setReceptionImages([]);
    setSignatureImage(null);
    setNewReceptionFiles([]);
    setHasNewSignature(false);
    clearVehicleSignatureCanvas();
    setIsVehicleModalOpen(false);
  };

  const toggleVehicleModalMode = () => {
    if (!selectedWorkOrderVehicle) return;

    if (isVehicleReadOnlyMode) {
      setVehicleModalMode('edit');
      return;
    }

    if (vehicleModalSnapshot) {
      hydrateVehicleModal(vehicleModalSnapshot);
    }

    setVehicleSubmitError('');
    setVehicleModalMode('view');
  };

  const handleVehicleFormChange = (event) => {
    const { name, value } = event.target;

    setVehicleFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceptionFilesChange = (event) => {
    setNewReceptionFiles(Array.from(event.target.files ?? []));
  };

  const handleRemoveReceptionImage = async (image) => {
    if (!window.confirm('Eliminar esta foto de recepcion?')) return;

    try {
      await deleteImage(image.public_id, 'VEHICLE_RECEPTION');
      setReceptionImages((prev) =>
        prev.filter((item) => item.public_id !== image.public_id),
      );
    } catch (vehicleError) {
      setVehicleSubmitError(vehicleError.message);
    }
  };

  const getSignatureCoordinates = (event) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pointer = event.touches ? event.touches[0] : event;

    return {
      x: (pointer.clientX - rect.left) * scaleX,
      y: (pointer.clientY - rect.top) * scaleY,
    };
  };

  const startVehicleSignatureDrawing = (event) => {
    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSignatureCoordinates(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawingSignature(true);
  };

  const drawVehicleSignature = (event) => {
    if (!isDrawingSignature) return;
    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSignatureCoordinates(event);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasNewSignature(true);
  };

  const stopVehicleSignatureDrawing = () => {
    setIsDrawingSignature(false);
  };

  const clearVehicleSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasNewSignature(false);
  };

  const vehicleCanvasToBlob = () =>
    new Promise((resolve, reject) => {
      const canvas = signatureCanvasRef.current;

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('No se pudo generar la firma.'));
          return;
        }

        resolve(blob);
      }, 'image/png');
    });

  const hasVehicleEditChanges = useMemo(() => {
    if (!selectedWorkOrderVehicle || !vehicleModalSnapshot) return false;

    const snapshotFormData = {
      client_id: vehicleModalSnapshot.client_id?._id ?? '',
      matricula: vehicleModalSnapshot.matricula ?? '',
      n_bastidor: vehicleModalSnapshot.n_bastidor ?? '',
      marca: vehicleModalSnapshot.marca ?? '',
      modelo: vehicleModalSnapshot.modelo ?? '',
      tipo_combustible: vehicleModalSnapshot.tipo_combustible ?? '',
      cantidad_combustible: String(vehicleModalSnapshot.cantidad_combustible ?? 0),
      year: vehicleModalSnapshot.year
        ? new Date(vehicleModalSnapshot.year).getFullYear().toString()
        : '',
      observaciones: vehicleModalSnapshot.observaciones ?? '',
    };

    return (
      JSON.stringify(normalizeVehicleFormData(vehicleFormData)) !==
        JSON.stringify(normalizeVehicleFormData(snapshotFormData)) ||
      newReceptionFiles.length > 0 ||
      hasNewSignature ||
      JSON.stringify(receptionImages) !==
        JSON.stringify(vehicleModalSnapshot.reception_images ?? []) ||
      JSON.stringify(signatureImage) !==
        JSON.stringify(vehicleModalSnapshot.customer_signature ?? null)
    );
  }, [
    hasNewSignature,
    newReceptionFiles.length,
    receptionImages,
    selectedWorkOrderVehicle,
    signatureImage,
    vehicleFormData,
    vehicleModalSnapshot,
  ]);

  const handleSubmitVehicle = async (event) => {
    event.preventDefault();
    setVehicleSubmitError('');

    if (
      !selectedWorkOrderVehicle ||
      !vehicleFormData.client_id ||
      !vehicleFormData.matricula.trim() ||
      !vehicleFormData.n_bastidor.trim() ||
      !vehicleFormData.marca.trim() ||
      !vehicleFormData.modelo.trim() ||
      !vehicleFormData.tipo_combustible.trim() ||
      !vehicleFormData.year.trim()
    ) {
      setVehicleSubmitError('Completa todos los campos obligatorios.');
      return;
    }

    setIsVehicleSubmitting(true);

    try {
      const uploadedReceptionImages = await Promise.all(
        newReceptionFiles.map((file) => uploadImage(file, 'VEHICLE_RECEPTION')),
      );

      let nextSignature = signatureImage;
      if (hasNewSignature) {
        const signatureBlob = await vehicleCanvasToBlob();
        const signatureFile = new File([signatureBlob], 'signature.png', {
          type: 'image/png',
        });
        const uploadedSignature = await uploadImage(signatureFile, 'VEHICLE_SIGNATURES');

        if (signatureImage?.public_id) {
          await deleteImage(signatureImage.public_id, 'VEHICLE_SIGNATURES');
        }

        nextSignature = {
          public_id: uploadedSignature.public_id,
          url: uploadedSignature.url,
        };
      }

      const updatedVehicle = normalizeVehicleMedia(
        await updateVehicle(selectedWorkOrderVehicle._id, {
          client_id: vehicleFormData.client_id,
          matricula: vehicleFormData.matricula.trim().toUpperCase(),
          n_bastidor: vehicleFormData.n_bastidor.trim(),
          marca: vehicleFormData.marca.trim(),
          modelo: vehicleFormData.modelo.trim(),
          tipo_combustible: vehicleFormData.tipo_combustible.trim(),
          cantidad_combustible: Number(vehicleFormData.cantidad_combustible),
          year: new Date(`${vehicleFormData.year}-01-01`).toISOString(),
          observaciones: vehicleFormData.observaciones.trim(),
          reception_images: [
            ...receptionImages,
            ...uploadedReceptionImages.map((image) => ({
              public_id: image.public_id,
              url: image.url,
            })),
          ],
          customer_signature: nextSignature,
        }),
      );

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle,
        ),
      );
      setVehicleModalSnapshot(updatedVehicle);
      hydrateVehicleModal(updatedVehicle);
      setVehicleModalMode('view');
    } catch (vehicleError) {
      setVehicleSubmitError(vehicleError.message);
    } finally {
      setIsVehicleSubmitting(false);
    }
  };

  return (
    <>
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
                mechanicOptions={mechanicOptions}
                statusOptions={statusOptions}
                onAssignMechanic={handleAssignMechanic}
              onChangeStatus={handleChangeStatus}
              onDownloadPdf={handleExportOrderPdf}
              onSendEmail={handleSendOrderEmail}
              onPreview={openPreviewModal}
              onOpenVehicle={openVehicleModal}
              isSendingEmail={sendingOrderId === order.id}
              isUpdatingMechanic={updatingOrderId === order.id}
              isUpdatingStatus={updatingStatusOrderId === order.id}
              />
            ))
          ) : (
            <Card className='p-10 text-center text-white/50'>
              No hay ordenes de trabajo para los filtros seleccionados.
            </Card>
          )}
        </div>
      </section>

      <Modal
        isOpen={Boolean(previewOrder)}
        title='Previsualización de la Orden'
        onClose={closePreviewModal}
        panelClassName='md:min-w-[52vw] max-w-4xl'
      >
        {previewOrder ? (
          <div className='space-y-6 text-white'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Orden
                </p>
                <p className='mt-3 text-xl font-semibold text-white'>
                  {previewOrder.orderNumber}
                </p>
                <p className='text-sm text-white/50'>
                  {formatDate(previewOrder.date)}
                </p>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Estado
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[previewOrder.status]}`}
                >
                  {previewOrder.status}
                </span>
              </div>
            </div>

            <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Vehículo
              </p>
              <p className='text-lg font-semibold text-white'>
                {previewOrder.vehicleName || 'Vehículo sin modelo'}
              </p>
              <p className='text-sm text-white/60'>{formatPlate(previewOrder.plate)}</p>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Cliente
                </p>
                <p className='mt-3 text-white'>{previewOrder.customerName}</p>
                <p className='text-sm text-white/50'>
                  {previewOrder.customerEmail || 'Sin email registrado'}
                </p>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Mecánico
                </p>
                <p className='mt-3 text-white'>{previewOrder.mechanicName}</p>
              </div>
            </div>

            <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Observaciones
              </p>
              <p className='mt-3 text-white/80'>{previewOrder.observations}</p>
            </div>

            <div className='flex justify-end gap-3'>
              <Button type='button' variant='secondary' onClick={closePreviewModal}>
                Cerrar
              </Button>

              <Button
                type='button'
                onClick={() => {
                  closePreviewModal();
                  openVehicleModal(previewOrder.vehicleId);
                }}
              >
                Ver vehículo
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isVehicleModalOpen}
        title={isVehicleReadOnlyMode ? 'Ver Vehiculo' : 'Editar Vehiculo'}
        onClose={closeVehicleModal}
        headerActions={
          selectedWorkOrderVehicle && profile.employee.rol === 'ADMIN' ? (
            <button
              type='button'
              onClick={toggleVehicleModalMode}
              className='flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white'
              aria-label={isVehicleReadOnlyMode ? 'Pasar a edición' : 'Pasar a vista'}
              title={isVehicleReadOnlyMode ? 'Pasar a edición' : 'Pasar a vista'}
            >
              <Icon name={isVehicleReadOnlyMode ? 'pencil' : 'eye'} className='h-4 w-4' />
            </button>
          ) : null
        }
        panelClassName='md:min-w-[50vw] max-w-6xl'
        bodyClassName='max-h-[80vh] overflow-y-auto'
      >
        <form onSubmit={isVehicleReadOnlyMode ? undefined : handleSubmitVehicle} className='space-y-6'>
          {isLoadingVehicleDetail ? (
            <p className='text-sm text-white/50'>Cargando datos completos del vehículo...</p>
          ) : null}

          {vehicleSubmitError ? (
            <p className='text-sm text-red-400'>{vehicleSubmitError}</p>
          ) : null}

          <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Datos Principales
                </p>

                <div className='grid gap-4 md:grid-cols-2'>
                  <Select
                    label='Cliente'
                    name='client_id'
                    value={vehicleFormData.client_id}
                    onChange={isVehicleReadOnlyMode ? undefined : handleVehicleFormChange}
                    options={formCustomerOptions}
                    disabled={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Matricula'
                    name='matricula'
                    value={vehicleFormData.matricula}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Marca'
                    name='marca'
                    value={vehicleFormData.marca}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Modelo'
                    name='modelo'
                    value={vehicleFormData.modelo}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Tipo de combustible'
                    name='tipo_combustible'
                    value={vehicleFormData.tipo_combustible}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />

                  <Select
                    label='Nivel combustible'
                    name='cantidad_combustible'
                    value={vehicleFormData.cantidad_combustible}
                    onChange={isVehicleReadOnlyMode ? undefined : handleVehicleFormChange}
                    options={[
                      { value: '0', label: 'Vacio' },
                      { value: '1', label: '1/4' },
                      { value: '2', label: '1/2' },
                      { value: '3', label: '3/4' },
                      { value: '4', label: 'Lleno' },
                    ]}
                    disabled={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Numero de bastidor'
                    name='n_bastidor'
                    value={vehicleFormData.n_bastidor}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />

                  <Input
                    label='Año'
                    name='year'
                    value={vehicleFormData.year}
                    onChange={handleVehicleFormChange}
                    readOnly={isVehicleReadOnlyMode}
                  />
                </div>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Observaciones
                </p>
                <textarea
                  name='observaciones'
                  value={vehicleFormData.observaciones}
                  onChange={isVehicleReadOnlyMode ? undefined : handleVehicleFormChange}
                  readOnly={isVehicleReadOnlyMode}
                  className='w-full h-32 rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white resize-none read-only:text-white/70'
                />
              </div>
            </div>

            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Fotos de recepcion
                </p>

                {receptionImages.length === 0 ? (
                  <p className='text-sm text-white/50'>No hay fotos guardadas.</p>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    {receptionImages.map((image) => (
                      <div key={image.public_id} className='relative'>
                        <img
                          src={image.url}
                          alt='Recepcion'
                          className='h-28 w-full rounded-xl object-cover border border-white/10'
                        />
                        {!isVehicleReadOnlyMode ? (
                          <button
                            type='button'
                            onClick={() => handleRemoveReceptionImage(image)}
                            className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs'
                          >
                            x
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {!isVehicleReadOnlyMode ? (
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleReceptionFilesChange}
                    className='w-full rounded-2xl bg-[#1F2937] px-4 py-3 border border-white/5 text-white'
                  />
                ) : null}

                {!isVehicleReadOnlyMode && newReceptionFiles.length > 0 ? (
                  <p className='text-xs text-white/50'>
                    {newReceptionFiles.length} archivo(s) listo(s) para subir.
                  </p>
                ) : null}
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Firma
                </p>

                {signatureImage ? (
                  <div className='space-y-3'>
                    <img
                      src={signatureImage.url}
                      alt='Firma'
                      className='h-28 w-full rounded-xl object-contain border border-white/10 p-2'
                    />
                    {!isVehicleReadOnlyMode ? (
                      <p className='text-xs text-white/50'>
                        Dibuja una nueva firma en el canvas para reemplazar la actual al guardar.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className='text-sm text-white/50'>
                    {isVehicleReadOnlyMode
                      ? 'No hay firma guardada.'
                      : 'No hay firma guardada. Puedes dibujarla abajo.'}
                  </p>
                )}

                {!isVehicleReadOnlyMode ? (
                  <div className='flex justify-end'>
                    <button
                      type='button'
                      onClick={clearVehicleSignatureCanvas}
                      className='px-3 py-2 rounded-xl bg-[#1F2937] text-xs text-white/70 hover:text-white'
                    >
                      Limpiar firma
                    </button>
                  </div>
                ) : null}

                <div className='rounded-2xl border border-white/10 bg-[#172033] p-3'>
                  <canvas
                    ref={signatureCanvasRef}
                    width={700}
                    height={180}
                    className={`w-full h-[180px] rounded-xl ${isVehicleReadOnlyMode ? '' : 'cursor-crosshair'}`}
                    onMouseDown={isVehicleReadOnlyMode ? undefined : startVehicleSignatureDrawing}
                    onMouseMove={isVehicleReadOnlyMode ? undefined : drawVehicleSignature}
                    onMouseUp={isVehicleReadOnlyMode ? undefined : stopVehicleSignatureDrawing}
                    onMouseLeave={isVehicleReadOnlyMode ? undefined : stopVehicleSignatureDrawing}
                    onTouchStart={isVehicleReadOnlyMode ? undefined : startVehicleSignatureDrawing}
                    onTouchMove={isVehicleReadOnlyMode ? undefined : drawVehicleSignature}
                    onTouchEnd={isVehicleReadOnlyMode ? undefined : stopVehicleSignatureDrawing}
                  />
                </div>

                {!isVehicleReadOnlyMode && hasNewSignature ? (
                  <p className='text-xs text-emerald-400'>
                    La nueva firma se guardará al pulsar `Actualizar`.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className='flex gap-3 justify-end'>
            <Button type='button' variant='secondary' onClick={closeVehicleModal}>
              {isVehicleReadOnlyMode ? 'Cerrar' : 'Cancelar'}
            </Button>

            {!isVehicleReadOnlyMode ? (
              <Button type='submit' disabled={!hasVehicleEditChanges}>
                {isVehicleSubmitting ? 'Guardando...' : 'Actualizar'}
              </Button>
            ) : null}
          </div>
        </form>
      </Modal>
    </>
  );
}
