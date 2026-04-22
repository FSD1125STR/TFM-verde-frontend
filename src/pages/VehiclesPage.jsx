import { useContext, useEffect, useMemo, useState } from 'react';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVehicleDetail, setIsLoadingVehicleDetail] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(
    searchParams.get('customer') || 'all',
  );
  const [formData, setFormData] = useState(emptyFormData);
  const [receptionImages, setReceptionImages] = useState([]);
  const [newReceptionFiles, setNewReceptionFiles] = useState([]);

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
    setNewReceptionFiles([]);
    setSubmitError('');
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

  const closeModal = () => {
    setEditingVehicle(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setReceptionImages([]);
    setNewReceptionFiles([]);
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
      });

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle._id === editingVehicle._id
            ? normalizeVehicleMedia(updatedVehicle)
            : vehicle,
        ),
      );
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

          <div className='flex flex-col gap-3 lg:flex-row'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por matricula, marca, modelo o cliente...'
              className='border-0'
            />

            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              options={customerOptions}
              className='border-0 lg:w-80'
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
                        <div className='space-y-3'>
                          <div className='flex flex-wrap gap-2'>
                            {vehicle.reception_images.length > 0 ? (
                              vehicle.reception_images.map((image) => (
                                <img
                                  key={image.public_id}
                                  src={image.url}
                                  alt='Recepcion'
                                  className='h-12 w-12 rounded-lg object-cover border border-white/10'
                                />
                              ))
                            ) : (
                              <div className='h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs'>
                                Foto
                              </div>
                            )}
                          </div>

                          {vehicle.customer_signature ? (
                            <img
                              src={vehicle.customer_signature.url}
                              alt='Firma'
                              className='h-12 w-20 rounded-lg object-cover border border-white/10 bg-white'
                            />
                          ) : (
                            <div className='h-12 w-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs'>
                              Firma
                            </div>
                          )}
                        </div>
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
