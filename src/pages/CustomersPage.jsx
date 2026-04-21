import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { LoginContext } from '../contexts/AuthContext';
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
  direccion: '',
  poblacion: '',
  CP: '',
  Pais: '',
  provincia: '',
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [formData, setFormData] = useState(emptyFormData);

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

  const openCreateModal = () => {
    setEditingCustomer(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setSubmitError('');
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
      direccion: customer.direccion ?? '',
      poblacion: customer.poblacion ?? '',
      CP: customer.CP ?? '',
      Pais: customer.Pais ?? '',
      provincia: customer.provincia ?? '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCustomer(null);
    setSubmitError('');
    setFormData(emptyFormData);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [name]: value,
      };

      if (name === 'type') {
        if (value === 'PRIVATE') {
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
      if (editingCustomer) {
        const updatedCustomer = await updateCustomer(editingCustomer._id, payload);
        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id === editingCustomer._id ? updatedCustomer : customer,
          ),
        );
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
      <section className='max-w-6xl space-y-6 text-white'>
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

          <div className='flex flex-col gap-3 lg:flex-row'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por nombre, DNI/CIF o email...'
              className='border-0'
            />

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Todos los Tipos' },
                { value: 'Particular', label: 'Particular' },
                { value: 'Empresa', label: 'Empresa' },
              ]}
              className='border-0 lg:w-52'
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
                      className='border-t border-white/5 hover:bg-white/2'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-semibold'>
                            {getInitials(customer.displayName)}
                          </div>

                          <div>
                            <p className='font-medium text-white'>
                              {customer.displayName}
                            </p>
                            <p className='text-white/50 text-xs'>
                              {customer.identifier}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCustomerTypeBadge(
                            customer.type,
                          )}`}
                        >
                          {customer.type === 'COMPANY' ? 'Empresa' : 'Particular'}
                        </span>
                      </td>

                      <td className='px-6 py-4'>
                        <p>{customer.Tfprin}</p>
                        <p className='text-white/50 text-xs'>{customer.email || '-'}</p>
                      </td>

                      <td className='px-6 py-4'>
                        <p>{customer.poblacion || '-'}</p>
                        <p className='text-white/50 text-xs'>{customer.provincia || '-'}</p>
                      </td>

                      <td className='px-6 py-4 text-right'>
                        {profile.employee.rol === 'ADMIN' ? (
                          <div className='flex justify-end gap-2'>
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
                          </div>
                        ) : null}
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
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmitCustomer} className='space-y-5'>
          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
          ) : null}

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
            />
          )}

          {isCompany ? (
            <>
              <Input
                label='CIF'
                name='cif'
                value={formData.cif}
                onChange={handleChange}
              />

              <Input
                label='Nombre de la compañía'
                name='company_name'
                value={formData.company_name}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <Input
                label='DNI'
                name='dni'
                value={formData.dni}
                onChange={handleChange}
              />

              <Input
                label='Nombre'
                name='name'
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                label='Apellidos'
                name='lastname'
                value={formData.lastname}
                onChange={handleChange}
              />
            </>
          )}

          <Input
            label='Teléfono principal'
            name='Tfprin'
            value={formData.Tfprin}
            onChange={handleChange}
          />

          <Input
            label='Teléfono secundario'
            name='Tf_sec'
            value={formData.Tf_sec}
            onChange={handleChange}
          />

          <Input
            label='Email'
            name='email'
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label='Dirección'
            name='direccion'
            value={formData.direccion}
            onChange={handleChange}
          />

          <Input
            label='Población'
            name='poblacion'
            value={formData.poblacion}
            onChange={handleChange}
          />

          <Input
            label='Código Postal'
            name='CP'
            value={formData.CP}
            onChange={handleChange}
          />

          <Input
            label='País'
            name='Pais'
            value={formData.Pais}
            onChange={handleChange}
          />

          <Input
            label='Provincia'
            name='provincia'
            value={formData.provincia}
            onChange={handleChange}
          />

          <div className='flex gap-3'>
            <Button type='button' variant='secondary' onClick={closeModal}>
              Cancelar
            </Button>

            <Button type='submit'>
              {isSubmitting
                ? 'Guardando...'
                : editingCustomer
                  ? 'Actualizar'
                  : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
