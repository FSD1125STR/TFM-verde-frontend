import { useContext, useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { getRoles } from '../services/roleApi';
import { LoginContext } from '../contexts/AuthContext';
import { deleteImage, uploadImage } from '../services/cloudinary.js';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from '../services/employeeApi';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadge(role) {
  switch (role) {
    case 'ADMIN':
    case 'Admin':
      return 'bg-purple-500/20 text-purple-300';
    case 'RECEPCIONISTA':
    case 'Recepcionista':
      return 'bg-blue-500/20 text-blue-300';
    case 'MECANICO':
    case 'MECÁNICO':
    case 'Mecánico':
      return 'bg-orange-500/20 text-orange-300';
    default:
      return 'bg-white/10 text-white/70';
  }
}

function getStatusBadge(status) {
  return status === 'Activo'
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-white/10 text-white/60';
}

export default function EmployeePage() {
  const { profile } = useContext(LoginContext);

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState('');
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState('');
  const [submitNotice, setSubmitNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
    profile_image: null,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      setEmployeesError('');

      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        setEmployeesError(error.message);
      } finally {
        setEmployeesLoading(false);
      }
    };

    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError('');

      try {
        const data = await getRoles();
        setRoles(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            role: data[0],
          }));
        }
      } catch (error) {
        setRolesError(error.message);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchEmployees();
    fetchRoles();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'Todos' || employee.rol === roleFilter;

      const matchesStatus =
        statusFilter === 'Todos' || employee.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
    setSubmitError('');
    setSubmitNotice('');
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: roles.length > 0 ? roles[0] : '',
      profile_image: null,
    });
    setProfileImageFile(null);
    setProfileImagePreview('');
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
    setSubmitError('');
    setSubmitNotice('');
    setFormData({
      name: employee.name ?? '',
      lastname: employee.lastname ?? '',
      email: employee.email ?? '',
      password: '',
      role: employee.rol ?? (roles.length > 0 ? roles[0] : ''),
      profile_image: employee.profile_image ?? null,
    });
    setProfileImageFile(null);
    setProfileImagePreview(employee.profile_image?.url ?? '');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setSubmitError('');
    setSubmitNotice('');
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: roles.length > 0 ? roles[0] : '',
      profile_image: null,
    });
    setProfileImageFile(null);
    setProfileImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setProfileImageFile(file);
    setProfileImagePreview(file ? URL.createObjectURL(file) : formData.profile_image?.url ?? '');
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitNotice('');

    if (
      !formData.name.trim() ||
      !formData.lastname.trim() ||
      !formData.email.trim() ||
      (!editingEmployee && !formData.password.trim()) ||
      !formData.role
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      let nextProfileImage = formData.profile_image;
      if (profileImageFile) {
        const uploadedImage = await uploadImage(profileImageFile, 'PROFILES');
        nextProfileImage = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url,
        };
      }

      const payload = {
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        rol: formData.role,
        profile_image: nextProfileImage,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (editingEmployee) {
        const updatedEmployee = await updateEmployee(editingEmployee._id, payload);

        if (
          profileImageFile &&
          editingEmployee.profile_image?.public_id &&
          editingEmployee.profile_image.public_id !== nextProfileImage?.public_id
        ) {
          try {
            await deleteImage(editingEmployee.profile_image.public_id, 'PROFILES');
          } catch (_error) {}
        }

        setEmployees((prev) =>
          prev.map((employee) =>
            employee._id === editingEmployee._id ? updatedEmployee : employee,
          ),
        );
      } else {
        const newEmployee = await createEmployee({
          ...payload,
          type: 'EMPLOYEE',
          password: formData.password,
        });

        setEmployees((prev) => [...prev, newEmployee]);

        if (newEmployee.emailInvitationSent) {
          setSubmitNotice('Empleado creado y email de acceso enviado correctamente.');
        } else if (newEmployee.emailInvitationSkipped) {
          setSubmitNotice(
            'Empleado creado. El email no se ha enviado porque el SMTP no está configurado en el backend.',
          );
        } else if (newEmployee.emailInvitationReason) {
          setSubmitNotice(
            `Empleado creado, pero el email no se pudo enviar: ${newEmployee.emailInvitationReason}`,
          );
        }
      }

      if (editingEmployee) {
        closeModal();
      } else {
        setEditingEmployee(null);
        setFormData({
          name: '',
          lastname: '',
          email: '',
          password: '',
          role: roles.length > 0 ? roles[0] : '',
          profile_image: null,
        });
        setProfileImageFile(null);
        setProfileImagePreview('');
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    setDeletingEmployeeId(id);

    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee._id !== id));
    } catch (error) {
      setEmployeesError(error.message);
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const roleOptions = roles.map((role) => ({
    value: role,
    label: role,
  }));

  const filterRoleOptions = [
    { value: 'Todos', label: 'Todos los Roles' },
    ...roleOptions,
  ];

  return (
    <>
      <section className='max-w-6xl space-y-6 text-white'>
        <PageHeader
          title='Gestión de Empleados'
          description='Administra el personal del taller y sus permisos.'
          action={
            profile.employee.rol === 'ADMIN' ? (
              <Button onClick={openCreateModal}>Añadir Empleado</Button>
            ) : null
          }
        />

        <Card className='p-4 space-y-4'>
          {employeesError ? (
            <p className='text-sm text-red-400'>{employeesError}</p>
          ) : null}

          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Filtros
              </p>
              <p className='mt-1 text-sm text-white/50'>
                Busca por empleado o acota el listado por rol y estado.
              </p>
            </div>

            <p className='text-sm text-white/50'>
              {filteredEmployees.length} empleado(s)
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr]'>
            <Input
              label='Busqueda'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Nombre o correo...'
              className='border-white/10 bg-[#111827]'
            />

            <Select
              label='Rol'
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={filterRoleOptions}
              className='border-white/10 bg-[#111827]'
            />

            <Select
              label='Estado'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Todos los Estados' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
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
                  <th className='text-left px-6 py-4'>Empleado</th>
                  <th className='text-left px-6 py-4'>Rol</th>
                  <th className='text-left px-6 py-4'>Estado</th>
                  <th className='text-right px-6 py-4'>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {employeesLoading ? (
                  <tr>
                    <td colSpan='4' className='text-center py-10 text-white/50'>
                      Cargando empleados...
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className='border-t border-white/5 align-top hover:bg-white/[0.03]'
                    >
                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <div className='flex items-center gap-3'>
                            {employee.profile_image?.url ? (
                              <img
                                src={employee.profile_image.url}
                                alt={`${employee.name} ${employee.lastname}`}
                                className='h-11 w-11 rounded-full border border-blue-500/30 object-cover'
                              />
                            ) : (
                              <div className='flex h-11 w-11 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20 font-semibold text-blue-300'>
                                {getInitials(employee.name)}
                              </div>
                            )}

                            <div className='min-w-0'>
                              <p className='font-medium text-white'>
                                {employee.name} {employee.lastname}
                              </p>
                              <p className='truncate text-xs text-white/50'>
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                            Acceso
                          </p>
                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getRoleBadge(
                              employee.rol,
                            )}`}
                          >
                            {employee.rol}
                          </span>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <div className='rounded-2xl border border-white/6 bg-white/[0.03] p-4'>
                          <p className='text-[11px] font-bold uppercase tracking-widest text-white/35'>
                            Estado
                          </p>
                          <span
                            className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                              employee.status || 'Activo',
                            )}`}
                          >
                            {employee.status || 'Activo'}
                          </span>
                        </div>
                      </td>

                      <td className='px-6 py-4 text-right'>
                        {profile.employee.rol === 'ADMIN' ? (
                          <div className='flex flex-wrap justify-end gap-2'>
                            <Button
                              variant='secondary'
                              onClick={() => openEditModal(employee)}
                            >
                              Editar
                            </Button>

                            <Button
                              variant='ghost'
                              onClick={() => handleDeleteEmployee(employee._id)}
                            >
                              {deletingEmployeeId === employee._id
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
                    <td colSpan='4' className='text-center py-10 text-white/50'>
                      No hay empleados
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
        title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
        onClose={closeModal}
        panelClassName='md:min-w-[60vw] max-w-6xl'
        bodyClassName='max-h-[80vh] overflow-y-auto'
      >
        <form onSubmit={handleSubmitEmployee} className='space-y-5'>
          {submitNotice ? (
            <p className='text-sm text-emerald-300'>{submitNotice}</p>
          ) : null}

          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
          ) : null}

          <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
            <div className='space-y-6'>
              <div className='rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4'>
                <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Datos Personales
                </p>

                <div className='grid gap-4 md:grid-cols-2'>
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

                  <Input
                    label='Email corporativo'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                  />

                  <Input
                    label={editingEmployee ? 'Nueva contraseña' : 'Contraseña'}
                    type='password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      editingEmployee ? 'Déjalo vacío para mantener la actual' : ''
                    }
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

                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleProfileImageChange}
                    className='w-full rounded-2xl bg-[#1F2937] px-4 py-3 border border-white/5 text-white'
                  />
                </div>

                {rolesLoading ? (
                  <p className='text-sm text-white/50'>Cargando roles...</p>
                ) : rolesError ? (
                  <p className='text-sm text-red-400'>{rolesError}</p>
                ) : (
                  <Select
                    label='Rol'
                    name='role'
                    value={formData.role}
                    onChange={handleChange}
                    options={roleOptions}
                  />
                )}
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button type='button' variant='secondary' onClick={closeModal}>
              Cancelar
            </Button>

            <Button type='submit'>
              {isSubmitting
                ? 'Guardando...'
                : editingEmployee
                  ? 'Actualizar'
                  : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
