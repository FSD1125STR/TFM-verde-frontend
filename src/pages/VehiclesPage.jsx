import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Select from '../components/ui/Select';
import { LoginContext } from '../contexts/AuthContext.js';
import { deleteImage, uploadImage } from '../services/cloudinary.js';
import { getCustomers } from '../services/customerApi.js';
import {
  deleteVehicle,
  getVehicleById,
  getVehicles,
  updateVehicle,
} from '../services/vehicleApi.js';

function getFuelLabel(level) {
  return ['Vacio', '1/4', '1/2', '3/4', 'Lleno'][level] ?? '-';
}

function getCustomerDisplayName(customer) {
  if (!customer) return '-';
  if (customer.company_name) return customer.company_name;

  return [customer.name, customer.lastname].filter(Boolean).join(' ');
}

function getCustomerIdentifier(customer) {
  if (!customer) return '-';

  return customer.cif || customer.dni || '-';
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

const emptyFormData = {
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

export default function VehiclesPage() {
  const { profile } = useContext(LoginContext);
  const signatureCanvasRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVehicleDetail, setIsLoadingVehicleDetail] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(
    searchParams.get('customer') || 'all',
  );
  const [formData, setFormData] = useState(emptyFormData);
  const [receptionImages, setReceptionImages] = useState([]);
  const [signatureImage, setSignatureImage] = useState(null);
  const [newReceptionFiles, setNewReceptionFiles] = useState([]);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [hasNewSignature, setHasNewSignature] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      setVehiclesLoading(true);
      setVehiclesError('');

      try {
        const [vehiclesData, customersData] = await Promise.all([
          getVehicles(),
          getCustomers(),
        ]);
        setVehicles(vehiclesData.map(normalizeVehicleMedia));
        setCustomers(customersData);
      } catch (error) {
        setVehiclesError(error.message);
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchPageData();
  }, []);

  useEffect(() => {
    if (selectedCustomer === 'all') {
      setSearchParams({});
      return;
    }

    setSearchParams({ customer: selectedCustomer });
  }, [selectedCustomer, setSearchParams]);

  const customerOptions = [
    { value: 'all', label: 'Todos los clientes' },
    ...customers.map((customer) => ({
      value: customer._id,
      label: `${customer.displayName} - ${customer.identifier}`,
    })),
  ];

  const formCustomerOptions = customers.map((customer) => ({
    value: customer._id,
    label: `${customer.displayName} - ${customer.identifier}`,
  }));

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const customerName = getCustomerDisplayName(
        vehicle.client_id,
      ).toLowerCase();
      const customerIdentifier = getCustomerIdentifier(
        vehicle.client_id,
      ).toLowerCase();
      const matchesSearch =
        vehicle.matricula.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(search.toLowerCase()) ||
        customerName.includes(search.toLowerCase()) ||
        customerIdentifier.includes(search.toLowerCase());

      const matchesCustomer =
        selectedCustomer === 'all' ||
        vehicle.client_id?._id === selectedCustomer;

      return matchesSearch && matchesCustomer;
    });
  }, [vehicles, search, selectedCustomer]);

  const hydrateEditModal = (vehicle) => {
    const normalizedVehicle = normalizeVehicleMedia(vehicle);

    setEditingVehicle(normalizedVehicle);
    setFormData({
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
    setReceptionImages(normalizedVehicle.reception_images);
    setSignatureImage(normalizedVehicle.customer_signature);
    setNewReceptionFiles([]);
    setSubmitError('');
    setHasNewSignature(false);
    clearSignatureCanvas();
  };

  const openEditModal = async (vehicle) => {
    setIsModalOpen(true);

    hydrateEditModal(vehicle);
    setIsLoadingVehicleDetail(true);

    try {
      const vehicleDetail = await getVehicleById(vehicle._id);
      hydrateEditModal(vehicleDetail);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsLoadingVehicleDetail(false);
    }
  };

  const openEvidenceModal = async (vehicle) => {
    setIsEvidenceModalOpen(true);
    setSelectedVehicle(normalizeVehicleMedia(vehicle));

    try {
      const vehicleDetail = await getVehicleById(vehicle._id);
      setSelectedVehicle(normalizeVehicleMedia(vehicleDetail));
    } catch (error) {
      setVehiclesError(error.message);
    }
  };

  const closeEvidenceModal = () => {
    setSelectedVehicle(null);
    setIsEvidenceModalOpen(false);
  };

  const closeModal = () => {
    setEditingVehicle(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setReceptionImages([]);
    setSignatureImage(null);
    setNewReceptionFiles([]);
    setHasNewSignature(false);
    clearSignatureCanvas();
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReceptionFilesChange = (e) => {
    setNewReceptionFiles(Array.from(e.target.files ?? []));
  };

  const handleRemoveReceptionImage = async (image) => {
    if (!window.confirm('Eliminar esta foto de recepcion?')) return;

    try {
      await deleteImage(image.public_id, 'VEHICLE_RECEPTION');
      setReceptionImages((prev) =>
        prev.filter((item) => item.public_id !== image.public_id),
      );
    } catch (error) {
      setSubmitError(error.message);
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

  const startSignatureDrawing = (event) => {
    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSignatureCoordinates(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawingSignature(true);
  };

  const drawSignature = (event) => {
    if (!isDrawingSignature) return;
    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getSignatureCoordinates(event);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasNewSignature(true);
  };

  const stopSignatureDrawing = () => {
    setIsDrawingSignature(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasNewSignature(false);
  };

  const canvasToBlob = () =>
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

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (
      !formData.client_id ||
      !formData.matricula.trim() ||
      !formData.n_bastidor.trim() ||
      !formData.marca.trim() ||
      !formData.modelo.trim() ||
      !formData.tipo_combustible.trim() ||
      !formData.year.trim()
    ) {
      setSubmitError('Completa todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedReceptionImages = await Promise.all(
        newReceptionFiles.map((file) => uploadImage(file, 'VEHICLE_RECEPTION')),
      );

      let nextSignature = signatureImage;
      if (hasNewSignature) {
        const signatureBlob = await canvasToBlob();
        const signatureFile = new File([signatureBlob], 'signature.png', {
          type: 'image/png',
        });
        const uploadedSignature = await uploadImage(
          signatureFile,
          'VEHICLE_SIGNATURES',
        );

        if (signatureImage?.public_id) {
          await deleteImage(signatureImage.public_id, 'VEHICLE_SIGNATURES');
        }

        nextSignature = {
          public_id: uploadedSignature.public_id,
          url: uploadedSignature.url,
        };
      }

      const updatedVehicle = await updateVehicle(editingVehicle._id, {
        client_id: formData.client_id,
        matricula: formData.matricula.trim().toUpperCase(),
        n_bastidor: formData.n_bastidor.trim(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        tipo_combustible: formData.tipo_combustible.trim(),
        cantidad_combustible: Number(formData.cantidad_combustible),
        year: new Date(`${formData.year}-01-01`).toISOString(),
        observaciones: formData.observaciones.trim(),
        reception_images: [
          ...receptionImages,
          ...uploadedReceptionImages.map((image) => ({
            public_id: image.public_id,
            url: image.url,
          })),
        ],
        customer_signature: nextSignature,
      });

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle._id === editingVehicle._id
            ? normalizeVehicleMedia(updatedVehicle)
            : vehicle,
        ),
      );
      setSignatureImage(nextSignature);
      closeModal();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    setDeletingVehicleId(vehicleId);

    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) =>
        prev.filter((vehicle) => vehicle._id !== vehicleId),
      );
    } catch (error) {
      setVehiclesError(error.message);
    } finally {
      setDeletingVehicleId(null);
    }
  };

  return (
    <>
      <section className='max-w-6xl space-y-6 text-white'>
        <PageHeader
          title='Vehiculos'
          description='Consulta, edita y elimina los vehiculos registrados.'
        />

        <Card className='p-4 space-y-4'>
          {vehiclesError ? (
            <p className='text-sm text-red-400'>{vehiclesError}</p>
          ) : null}

          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Filtros
              </p>
              <p className='mt-1 text-sm text-white/50'>
                Busca por vehiculo o limita el listado a un cliente concreto.
              </p>
            </div>

            <p className='text-sm text-white/50'>
              {filteredVehicles.length} vehiculo(s)
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-[1.4fr_0.9fr]'>
            <Input
              label='Busqueda'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Matricula, marca, modelo, cliente...'
              className='border-white/10 bg-[#111827]'
            />

            <Select
              label='Cliente'
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              options={customerOptions}
              className='border-white/10 bg-[#111827]'
            />
          </div>
        </Card>

        <Card className='overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-white/5 text-white/60 uppercase text-xs'>
                <tr>
                  <th className='text-left px-6 py-4'>Vehiculo</th>
                  <th className='text-left px-6 py-4'>Cliente</th>
                  <th className='text-left px-6 py-4'>Combustible</th>
                  <th className='text-left px-6 py-4'>Evidencias</th>
                  <th className='text-left px-6 py-4'>Observaciones</th>
                  <th className='text-right px-6 py-4'>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vehiclesLoading ? (
                  <tr>
                    <td colSpan='6' className='text-center py-10 text-white/50'>
                      Cargando vehiculos...
                    </td>
                  </tr>
                ) : filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle._id}
                      className='border-t border-white/5 hover:bg-white/2'
                    >
                      <td className='px-6 py-4'>
                        <p className='font-medium text-white'>
                          {vehicle.marca} {vehicle.modelo}
                        </p>
                        <p className='text-white/50 text-xs'>
                          {vehicle.matricula} · {vehicle.n_bastidor}
                        </p>
                      </td>

                      <td className='px-6 py-4'>
                        <p>{getCustomerDisplayName(vehicle.client_id)}</p>
                        <p className='text-white/50 text-xs'>
                          {getCustomerIdentifier(vehicle.client_id)}
                        </p>
                      </td>

                      <td className='px-6 py-4'>
                        <p>{vehicle.tipo_combustible}</p>
                        <p className='text-white/50 text-xs'>
                          {getFuelLabel(vehicle.cantidad_combustible)}
                        </p>
                      </td>

                      <td className='px-6 py-4'>
                        <button
                          type='button'
                          onClick={() => openEvidenceModal(vehicle)}
                          className='w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-blue-500/40 hover:bg-white/10'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='space-y-3'>
                              <p className='text-xs font-bold uppercase tracking-widest text-white/40'>
                                Evidencias
                              </p>

                              <div className='flex flex-wrap gap-2 text-xs'>
                                <span className='rounded-full bg-[#111827] px-3 py-1 text-white/80'>
                                  {vehicle.reception_images.length} foto(s)
                                </span>
                                <span className='rounded-full bg-[#111827] px-3 py-1 text-white/80'>
                                  {vehicle.customer_signature
                                    ? 'Firma disponible'
                                    : 'Sin firma'}
                                </span>
                              </div>

                              <p className='text-sm text-white/70'>
                                Abrir galeria y firma
                              </p>
                            </div>

                            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-300'>
                              →
                            </div>
                          </div>
                        </button>
                      </td>

                      <td className='px-6 py-4'>
                        <p className='text-white/80'>
                          {vehicle.observaciones || '-'}
                        </p>
                      </td>

                      <td className='px-6 py-4 text-right'>
                        {profile.employee.rol === 'ADMIN' ? (
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='secondary'
                              onClick={() => openEditModal(vehicle)}
                            >
                              Editar
                            </Button>

                            <Button
                              variant='ghost'
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                            >
                              {deletingVehicleId === vehicle._id
                                ? 'Eliminando...'
                                : 'Eliminar'}
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='6' className='text-center py-10 text-white/50'>
                      No hay vehiculos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Modal
        isOpen={isEvidenceModalOpen}
        title='Evidencias del Vehiculo'
        onClose={closeEvidenceModal}
        panelClassName='md:min-w-[50vw] max-w-5xl'
        bodyClassName='max-h-[80vh] overflow-y-auto'
      >
        <div className='space-y-6'>
          {selectedVehicle ? (
            <>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Vehiculo
                </p>
                <p className='mt-2 text-white'>
                  {selectedVehicle.marca} {selectedVehicle.modelo} ·{' '}
                  {selectedVehicle.matricula}
                </p>
                <p className='text-sm text-white/50'>
                  {getCustomerDisplayName(selectedVehicle.client_id)}
                </p>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Fotos de recepcion
                </p>

                {selectedVehicle.reception_images.length > 0 ? (
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {selectedVehicle.reception_images.map((image) => (
                      <img
                        key={image.public_id}
                        src={image.url}
                        alt='Recepcion'
                        className='h-48 w-full rounded-2xl object-cover border border-white/10'
                      />
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-white/50'>
                    No hay fotos guardadas.
                  </p>
                )}
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Firma
                </p>

                {selectedVehicle.customer_signature ? (
                  <img
                    src={selectedVehicle.customer_signature.url}
                    alt='Firma'
                    className='h-40 w-full rounded-2xl object-contain border border-white/10 p-3'
                  />
                ) : (
                  <p className='text-sm text-white/50'>
                    No hay firma guardada.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className='text-sm text-white/50'>Cargando evidencias...</p>
          )}

          <div className='flex justify-end'>
            <Button type='button' variant='secondary' onClick={closeEvidenceModal}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        title='Editar Vehiculo'
        onClose={closeModal}
        panelClassName='md:min-w-[50vw] max-w-6xl'
        bodyClassName='max-h-[80vh] overflow-y-auto'
      >
        <form onSubmit={handleSubmitVehicle} className='space-y-6'>
          {isLoadingVehicleDetail ? (
            <p className='text-sm text-white/50'>
              Cargando datos completos del vehículo...
            </p>
          ) : null}

          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
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
                    value={formData.client_id}
                    onChange={handleChange}
                    options={formCustomerOptions}
                  />

                  <Input
                    label='Matricula'
                    name='matricula'
                    value={formData.matricula}
                    onChange={handleChange}
                  />

                  <Input
                    label='Marca'
                    name='marca'
                    value={formData.marca}
                    onChange={handleChange}
                  />

                  <Input
                    label='Modelo'
                    name='modelo'
                    value={formData.modelo}
                    onChange={handleChange}
                  />

                  <Input
                    label='Tipo de combustible'
                    name='tipo_combustible'
                    value={formData.tipo_combustible}
                    onChange={handleChange}
                  />

                  <Select
                    label='Nivel combustible'
                    name='cantidad_combustible'
                    value={formData.cantidad_combustible}
                    onChange={handleChange}
                    options={[
                      { value: '0', label: 'Vacio' },
                      { value: '1', label: '1/4' },
                      { value: '2', label: '1/2' },
                      { value: '3', label: '3/4' },
                      { value: '4', label: 'Lleno' },
                    ]}
                  />

                  <Input
                    label='Numero de bastidor'
                    name='n_bastidor'
                    value={formData.n_bastidor}
                    onChange={handleChange}
                  />

                  <Input
                    label='Año'
                    name='year'
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Observaciones
                </p>
                <textarea
                  name='observaciones'
                  value={formData.observaciones}
                  onChange={handleChange}
                  className='w-full h-32 rounded-2xl bg-[#1F2937] px-4 py-3 outline-none border border-white/5 text-white resize-none'
                />
              </div>
            </div>

            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-3'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Fotos de recepcion
                </p>

                {receptionImages.length === 0 ? (
                  <p className='text-sm text-white/50'>
                    No hay fotos guardadas.
                  </p>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    {receptionImages.map((image) => (
                      <div key={image.public_id} className='relative'>
                        <img
                          src={image.url}
                          alt='Recepcion'
                          className='h-28 w-full rounded-xl object-cover border border-white/10'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveReceptionImage(image)}
                          className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs'
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleReceptionFilesChange}
                  className='w-full rounded-2xl bg-[#1F2937] px-4 py-3 border border-white/5 text-white'
                />

                {newReceptionFiles.length > 0 ? (
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
                    <p className='text-xs text-white/50'>
                      Dibuja una nueva firma en el canvas para reemplazar la
                      actual al guardar.
                    </p>
                  </div>
                ) : (
                  <p className='text-sm text-white/50'>
                    No hay firma guardada. Puedes dibujarla abajo.
                  </p>
                )}

                <div className='flex justify-end'>
                  <button
                    type='button'
                    onClick={clearSignatureCanvas}
                    className='px-3 py-2 rounded-xl bg-[#1F2937] text-xs text-white/70 hover:text-white'
                  >
                    Limpiar firma
                  </button>
                </div>

                <div className='rounded-2xl border border-white/10 bg-[#172033] p-3'>
                  <canvas
                    ref={signatureCanvasRef}
                    width={700}
                    height={180}
                    className='w-full h-[180px] rounded-xl cursor-crosshair'
                    onMouseDown={startSignatureDrawing}
                    onMouseMove={drawSignature}
                    onMouseUp={stopSignatureDrawing}
                    onMouseLeave={stopSignatureDrawing}
                    onTouchStart={startSignatureDrawing}
                    onTouchMove={drawSignature}
                    onTouchEnd={stopSignatureDrawing}
                  />
                </div>

                {hasNewSignature ? (
                  <p className='text-xs text-emerald-400'>
                    La nueva firma se guardará al pulsar `Actualizar`.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className='flex gap-3 justify-end'>
            <Button type='button' variant='secondary' onClick={closeModal}>
              Cancelar
            </Button>

            <Button type='submit'>
              {isSubmitting ? 'Guardando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
