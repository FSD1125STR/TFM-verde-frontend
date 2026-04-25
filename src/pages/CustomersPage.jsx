import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { LoginContext } from '../contexts/AuthContext';
import { deleteImage, uploadImage } from '../services/cloudinary.js';
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../services/customerApi.js';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getCustomerTypeBadge(type) {
  return type === 'COMPANY'
    ? 'bg-blue-500/20 text-blue-300'
    : 'bg-emerald-500/20 text-emerald-300';
}

const emptyFormData = {
  type: 'PRIVATE',
  dni: '',
  name: '',
  lastname: '',
  cif: '',
  company_name: '',
  Tfprin: '',
  Tf_sec: '',
  email: '',
  profile_image: null,
  direccion: '',
  poblacion: '',
  CP: '',
  Pais: '',
  provincia: '',
};

function sanitizePostalCode(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 5);
}

function normalizeCustomerFormData(data) {
  return {
    type: data.type ?? 'PRIVATE',
    dni: (data.dni ?? '').trim(),
    name: (data.name ?? '').trim(),
    lastname: (data.lastname ?? '').trim(),
    cif: (data.cif ?? '').trim(),
    company_name: (data.company_name ?? '').trim(),
    Tfprin: (data.Tfprin ?? '').trim(),
    Tf_sec: (data.Tf_sec ?? '').trim(),
    email: (data.email ?? '').trim(),
    direccion: (data.direccion ?? '').trim(),
    poblacion: (data.poblacion ?? '').trim(),
    CP: sanitizePostalCode(data.CP),
    Pais: (data.Pais ?? '').trim(),
    provincia: (data.provincia ?? '').trim(),
    profile_image: data.profile_image
      ? {
          public_id: data.profile_image.public_id ?? '',
          url: data.profile_image.url ?? '',
        }
      : null,
  };
}

export default function CustomersPage() {
  const { profile } = useContext(LoginContext);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [modalCustomerSnapshot, setModalCustomerSnapshot] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [formData, setFormData] = useState(emptyFormData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError('');

      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        setCustomersError(error.message);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.displayName.toLowerCase().includes(search.toLowerCase()) ||
        customer.identifier.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase());

      const customerType =
        customer.type === 'COMPANY' ? 'Empresa' : 'Particular';
      const matchesType = typeFilter === 'Todos' || customerType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [customers, search, typeFilter]);

  const isReadOnlyMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';

  const applyCustomerToForm = (customer) => {
    setFormData({
      type: customer.type ?? 'PRIVATE',
      dni: customer.dni ?? '',
      name: customer.name ?? '',
      lastname: customer.lastname ?? '',
      cif: customer.cif ?? '',
      company_name: customer.company_name ?? '',
      Tfprin: customer.Tfprin ?? '',
      Tf_sec: customer.Tf_sec ?? '',
      email: customer.email ?? '',
      profile_image: customer.profile_image ?? null,
      direccion: customer.direccion ?? '',
      poblacion: customer.poblacion ?? '',
      CP: sanitizePostalCode(customer.CP),
      Pais: customer.Pais ?? '',
      provincia: customer.provincia ?? '',
    });
    setProfileImageFile(null);
    setProfileImagePreview(customer.profile_image?.url ?? '');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCustomer(null);
    setModalCustomerSnapshot(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setProfileImageFile(null);
    setProfileImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setModalMode('edit');
    setEditingCustomer(customer);
    setModalCustomerSnapshot(customer);
    setSubmitError('');
    applyCustomerToForm(customer);
    setIsModalOpen(true);
  };

  const openViewModal = (customer) => {
    setModalMode('view');
    setEditingCustomer(customer);
    setModalCustomerSnapshot(customer);
    setSubmitError('');
    applyCustomerToForm(customer);
    setIsModalOpen(true);
  };

  const toggleModalMode = () => {
    if (!editingCustomer) return;

    if (isReadOnlyMode) {
      setModalMode('edit');
      return;
    }

    if (modalCustomerSnapshot) {
      applyCustomerToForm(modalCustomerSnapshot);
      setEditingCustomer(modalCustomerSnapshot);
    }

    setSubmitError('');
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode('create');
    setEditingCustomer(null);
    setModalCustomerSnapshot(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setProfileImageFile(null);
    setProfileImagePreview('');
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'CP' ? sanitizePostalCode(value) : value;

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [name]: nextValue,
      };

      if (name === 'type') {
        if (nextValue === 'PRIVATE') {
          nextFormData.cif = '';
          nextFormData.company_name = '';
        } else {
          nextFormData.dni = '';
          nextFormData.name = '';
          nextFormData.lastname = '';
        }
      }

      return nextFormData;
    });
  };

  const hasEditChanges = useMemo(() => {
    if (!editingCustomer || !modalCustomerSnapshot) return false;

    return (
      JSON.stringify(normalizeCustomerFormData(formData)) !==
        JSON.stringify(normalizeCustomerFormData(modalCustomerSnapshot)) ||
      Boolean(profileImageFile)
    );
  }, [editingCustomer, formData, modalCustomerSnapshot, profileImageFile]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setProfileImageFile(file);
    setProfileImagePreview(
      file ? URL.createObjectURL(file) : formData.profile_image?.url ?? '',
    );
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const isPrivateCustomer = formData.type === 'PRIVATE';

    if (
      !formData.Tfprin.trim() ||
      (isPrivateCustomer &&
        (!formData.dni.trim() ||
          !formData.name.trim() ||
          !formData.lastname.trim())) ||
      (!isPrivateCustomer &&
        (!formData.cif.trim() || !formData.company_name.trim()))
    ) {
      setSubmitError('Completa todos los campos obligatorios para el tipo de cliente.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      type: formData.type,
      Tfprin: formData.Tfprin.trim(),
      Tf_sec: formData.Tf_sec.trim(),
      email: formData.email.trim(),
      profile_image: formData.profile_image ?? null,
      direccion: formData.direccion.trim(),
      poblacion: formData.poblacion.trim(),
      CP: formData.CP.trim(),
      Pais: formData.Pais.trim(),
      provincia: formData.provincia.trim(),
      dni: isPrivateCustomer ? formData.dni.trim() : '',
      name: isPrivateCustomer ? formData.name.trim() : '',
      lastname: isPrivateCustomer ? formData.lastname.trim() : '',
      cif: isPrivateCustomer ? '' : formData.cif.trim(),
      company_name: isPrivateCustomer ? '' : formData.company_name.trim(),
    };

    try {
      if (profileImageFile) {
        const uploadedImage = await uploadImage(profileImageFile, 'PROFILES');
        payload.profile_image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url,
        };
      }

      if (editingCustomer) {
        const updatedCustomer = await updateCustomer(editingCustomer._id, payload);

        if (
          profileImageFile &&
          editingCustomer.profile_image?.public_id &&
          editingCustomer.profile_image.public_id !== payload.profile_image?.public_id
        ) {
          try {
            await deleteImage(editingCustomer.profile_image.public_id, 'PROFILES');
          } catch (_error) {}
        }

        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id === editingCustomer._id ? updatedCustomer : customer,
          ),
        );
        setModalCustomerSnapshot(updatedCustomer);
      } else {
        const newCustomer = await createCustomer(payload);
        setCustomers((prev) => [...prev, newCustomer]);
      }

      closeModal();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    setDeletingCustomerId(id);

    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    } catch (error) {
      setCustomersError(error.message);
    } finally {
      setDeletingCustomerId(null);
    }
  };

  const isCompany = formData.type === 'COMPANY';

  return (
    <>
      <section className='w-full space-y-6 text-white'>
        <PageHeader
          title='Gestión de Clientes'
          description='Crea, consulta y administra los clientes del taller.'
          action={
            profile.employee.rol === 'ADMIN' ? (
              <Button onClick={openCreateModal}>Añadir Cliente</Button>
            ) : null
          }
        />

        <Card className='p-4 space-y-4'>
          {customersError ? (
            <p className='text-sm text-red-400'>{customersError}</p>
          ) : null}

          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Filtros
              </p>
              <p className='mt-1 text-sm text-white/50'>
                Busca por cliente o limita el listado por tipo.
              </p>
            </div>

            <p className='text-sm text-white/50'>
              {filteredCustomers.length} cliente(s)
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-[1.3fr_0.8fr]'>
            <Input
              label='Busqueda'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Nombre, DNI/CIF o email...'
              className='border-white/10 bg-[#111827]'
            />

            <Select
              label='Tipo'
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Todos los Tipos' },
                { value: 'Particular', label: 'Particular' },
                { value: 'Empresa', label: 'Empresa' },
              ]}
              className='border-white/10 bg-[#111827]'
            />
          </div>
        </Card>

        <Card className='overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-white/5 text-white/60 uppercase text-xs'>
                <tr>
                  <th className='text-left px-6 py-4'>Cliente</th>
                  <th className='text-left px-6 py-4'>Tipo</th>
                  <th className='text-left px-6 py-4'>Contacto</th>
                  <th className='text-left px-6 py-4'>Ubicación</th>
                  <th className='text-right px-6 py-4'>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {customersLoading ? (
                  <tr>
                    <td colSpan='5' className='text-center py-10 text-white/50'>
                      Cargando clientes...
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className='border-t border-white/5 align-top hover:bg-white/[0.03]'
                    >
                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <div className='flex items-center gap-3'>
                            {customer.profile_image?.url ? (
                              <img
                                src={customer.profile_image.url}
                                alt={customer.displayName}
                                className='h-11 w-11 rounded-full border border-blue-500/30 object-cover'
                              />
                            ) : (
                              <div className='flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 font-semibold text-blue-300'>
                                {getInitials(customer.displayName)}
                              </div>
                            )}

                            <div className='min-w-0'>
                              <p className='font-medium text-white'>
                                {customer.displayName}
                              </p>
                              <p className='truncate text-xs text-white/50'>
                                {customer.identifier}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                            Perfil
                          </p>
                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getCustomerTypeBadge(
                              customer.type,
                            )}`}
                          >
                            {customer.type === 'COMPANY' ? 'Empresa' : 'Particular'}
                          </span>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                            Contacto
                          </p>
                          <p className='mt-3 text-white'>{customer.Tfprin}</p>
                          <p className='truncate text-xs text-white/50'>
                            {customer.email || '-'}
                          </p>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                            Ubicación
                          </p>
                          <p className='mt-3 text-white'>{customer.poblacion || '-'}</p>
                          <p className='text-xs text-white/50'>
                            {customer.provincia || '-'}
                          </p>
                        </div>
                      </td>

                      <td className='px-6 py-4 text-right'>
                        <div className='flex flex-wrap justify-end gap-2'>
                          <button
                            type='button'
                            onClick={() => openViewModal(customer)}
                            className='flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:border-blue-500/40 hover:bg-white/5 hover:text-blue-300'
                            aria-label='Ver cliente'
                            title='Ver cliente'
                          >
                            <Icon name='eye' className='h-5 w-5' />
                          </button>

                          {profile.employee.rol === 'ADMIN' ? (
                            <>
                            <Button
                              variant='secondary'
                              onClick={() =>
                                navigate(`/vehicles?customer=${customer._id}`)
                              }
                            >
                              Ver vehículos
                            </Button>

                            <Button
                              variant='secondary'
                              onClick={() => openEditModal(customer)}
                            >
                              Editar
                            </Button>

                            <Button
                              variant='ghost'
                              onClick={() => handleDeleteCustomer(customer._id)}
                            >
                              {deletingCustomerId === customer._id
                                ? 'Eliminando...'
                                : 'Eliminar'}
                            </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='5' className='text-center py-10 text-white/50'>
                      No hay clientes
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
        title={
          isReadOnlyMode
            ? 'Ver Cliente'
            : editingCustomer
              ? 'Editar Cliente'
              : 'Nuevo Cliente'
        }
        onClose={closeModal}
        headerActions={
          editingCustomer && profile.employee.rol === 'ADMIN' ? (
            <button
              type='button'
              onClick={toggleModalMode}
              className='flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white'
              aria-label={isReadOnlyMode ? 'Pasar a edición' : 'Pasar a vista'}
              title={isReadOnlyMode ? 'Pasar a edición' : 'Pasar a vista'}
            >
              <Icon
                name={isReadOnlyMode ? 'pencil' : 'eye'}
                className='h-4 w-4'
              />
            </button>
          ) : null
        }
        panelClassName='md:min-w-[58vw] max-w-6xl'
        bodyClassName='max-h-[80vh] overflow-y-auto'
      >
        <form onSubmit={isReadOnlyMode ? undefined : handleSubmitCustomer} className='space-y-5'>
          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
          ) : null}

          <div className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Identidad
                </p>

                {editingCustomer ? (
                  <div>
                    <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40'>
                      Tipo de cliente
                    </label>

                    <div className='w-full rounded-2xl bg-[#1F2937] px-4 py-3 border border-white/5 text-white/70'>
                      {formData.type === 'COMPANY' ? 'Compañía' : 'Particular'}
                    </div>
                  </div>
                ) : (
                  <Select
                    label='Tipo de cliente'
                    name='type'
                    value={formData.type}
                    onChange={handleChange}
                    options={[
                      { value: 'PRIVATE', label: 'Particular' },
                      { value: 'COMPANY', label: 'Compañía' },
                    ]}
                    disabled={isReadOnlyMode}
                  />
                )}

                {isCompany ? (
                  <div className='grid gap-4 md:grid-cols-2'>
                    <Input
                      label='CIF'
                      name='cif'
                      value={formData.cif}
                      onChange={handleChange}
                      readOnly={isReadOnlyMode}
                    />

                    <Input
                      label='Nombre de la compañía'
                      name='company_name'
                      value={formData.company_name}
                      onChange={handleChange}
                      readOnly={isReadOnlyMode}
                    />
                  </div>
                ) : (
                  <div className='grid gap-4 md:grid-cols-3'>
                    <Input
                      label='DNI'
                      name='dni'
                      value={formData.dni}
                      onChange={handleChange}
                      readOnly={isReadOnlyMode}
                    />

                    <Input
                      label='Nombre'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={isReadOnlyMode}
                    />

                    <Input
                      label='Apellidos'
                      name='lastname'
                      value={formData.lastname}
                      onChange={handleChange}
                      readOnly={isReadOnlyMode}
                    />
                  </div>
                )}
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Contacto
                </p>

                <div className='grid gap-4 md:grid-cols-3'>
                  <Input
                    label='Teléfono principal'
                    name='Tfprin'
                    value={formData.Tfprin}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />

                  <Input
                    label='Teléfono secundario'
                    name='Tf_sec'
                    value={formData.Tf_sec}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />

                  <Input
                    label='Email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Perfil
                </p>

                <div className='flex items-center gap-4'>
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt='Previsualizacion'
                      className='h-16 w-16 rounded-full object-cover border border-white/10'
                    />
                  ) : (
                    <div className='flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40'>
                      Foto
                    </div>
                  )}

                  {!isReadOnlyMode ? (
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleProfileImageChange}
                      className='w-full rounded-2xl bg-[#1F2937] px-4 py-3 border border-white/5 text-white'
                    />
                  ) : null}
                </div>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Ubicación
                </p>

                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  <Input
                    label='Dirección'
                    name='direccion'
                    value={formData.direccion}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />

                  <Input
                    label='Población'
                    name='poblacion'
                    value={formData.poblacion}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />

                  <Input
                    label='Código Postal'
                    name='CP'
                    value={formData.CP}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                    inputMode='numeric'
                    pattern='[0-9]{5}'
                    maxLength={5}
                  />

                  <Input
                    label='País'
                    name='Pais'
                    value={formData.Pais}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />

                  <Input
                    label='Provincia'
                    name='provincia'
                    value={formData.provincia}
                    onChange={handleChange}
                    readOnly={isReadOnlyMode}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button type='button' variant='secondary' onClick={closeModal}>
              {isReadOnlyMode ? 'Cerrar' : 'Cancelar'}
            </Button>

            {!isReadOnlyMode ? (
              <Button
                type='submit'
                disabled={!isCreateMode && !hasEditChanges}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : isCreateMode
                    ? 'Guardar'
                    : 'Actualizar'}
              </Button>
            ) : null}
          </div>
        </form>
      </Modal>
    </>
  );
}
