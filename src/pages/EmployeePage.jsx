import { useContext, useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { getRoles } from '../services/roleApi';
import { LoginContext } from '../contexts/AuthContext';
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
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
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
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: roles.length > 0 ? roles[0] : '',
    });
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
    setSubmitError('');
    setFormData({
      name: employee.name ?? '',
      lastname: employee.lastname ?? '',
      email: employee.email ?? '',
      password: '',
      role: employee.rol ?? (roles.length > 0 ? roles[0] : ''),
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setSubmitError('');
    setFormData({
      name: '',
      lastname: '',
      email: '',
      password: '',
      role: roles.length > 0 ? roles[0] : '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    setSubmitError('');

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
      const payload = {
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        rol: formData.role,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (editingEmployee) {
        const updatedEmployee = await updateEmployee(editingEmployee._id, payload);

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
      }

      closeModal();
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

          <div className='flex flex-col gap-3 lg:flex-row'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por nombre o correo...'
              className='border-0'
            />

            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={filterRoleOptions}
              className='border-0 lg:w-52'
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'Todos', label: 'Todos los Estados' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
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
                      className='border-t border-white/5 hover:bg-white/2'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-semibold'>
                            {getInitials(employee.name)}
                          </div>

                          <div>
                            <p className='font-medium text-white'>
                              {employee.name} {employee.lastname}
                            </p>
                            <p className='text-white/50 text-xs'>
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-6 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                            employee.rol,
                          )}`}
                        >
                          {employee.rol}
                        </span>
                      </td>

                      <td className='px-6 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            employee.status || 'Activo',
                          )}`}
                        >
                          {employee.status || 'Activo'}
                        </span>
                      </td>

                      <td className='px-6 py-4 text-right'>
                        {profile.employee.rol === 'ADMIN' ? (
                          <div className='flex justify-end gap-2'>
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
      >
        <form onSubmit={handleSubmitEmployee} className='space-y-5'>
          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
          ) : null}

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
            label={
              editingEmployee
                ? 'Nueva contraseña'
                : 'Contraseña'
            }
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder={
              editingEmployee ? 'Déjalo vacío para mantener la actual' : ''
            }
          />

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
