import { useContext, useEffect, useMemo, useState } from 'react';
import Chat from '../components/websockets/Chat.jsx';
import { LoginContext } from '../contexts/AuthContext.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Modal from '../components/ui/Modal.jsx';
import {
  createChatGroup,
  deleteChatGroup,
  getChatGroups,
  updateChatGroup,
} from '../services/chatApi.js';

const emptyGroupForm = {
  name: '',
  description: '',
  color: '#2563EB',
};

const isAdminRole = (role) => ['ADMIN', 'SUPERADMIN'].includes(role);

export default function ChatPage() {
  const { profile } = useContext(LoginContext);

  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState('');
  const [joinedGroup, setJoinedGroup] = useState(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  const currentUser = useMemo(
    () => ({
      id: profile?.employee?._id ?? profile?.employee?.id ?? profile?.employee?.email,
      name:
        [profile?.employee?.name, profile?.employee?.lastname]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        profile?.employee?.name_company ||
        profile?.employee?.email ||
        'Usuario',
      role: profile?.employee?.rol ?? '',
    }),
    [profile],
  );

  const adminMode = isAdminRole(currentUser.role);

  const fetchGroups = async () => {
    setGroupsLoading(true);
    setGroupsError('');

    try {
      const data = await getChatGroups();
      setGroups(data);
      setJoinedGroup((prev) =>
        prev ? data.find((group) => group.id === prev.id) ?? null : null,
      );
    } catch (error) {
      setGroupsError(error.message);
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchGroups();
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return groups.filter((group) => {
      if (!normalizedSearch) return true;

      return (
        group.name.toLowerCase().includes(normalizedSearch) ||
        (group.description || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [groups, search]);

  const openCreateModal = () => {
    setEditingGroup(null);
    setGroupForm(emptyGroupForm);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name ?? '',
      description: group.description ?? '',
      color: group.color ?? '#2563EB',
    });
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingGroup(null);
    setGroupForm(emptyGroupForm);
    setSubmitError('');
    setIsModalOpen(false);
  };

  const handleGroupFormChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!groupForm.name.trim()) {
      setSubmitError('El nombre del grupo es obligatorio.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGroup) {
        const updatedGroup = await updateChatGroup(editingGroup.id, groupForm);
        setGroups((prev) =>
          prev.map((group) => (group.id === editingGroup.id ? updatedGroup : group)),
        );
        setJoinedGroup((prev) =>
          prev?.id === editingGroup.id ? updatedGroup : prev,
        );
      } else {
        const newGroup = await createChatGroup(groupForm);
        setGroups((prev) => [newGroup, ...prev]);
      }

      closeModal();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setDeletingGroupId(groupId);

    try {
      await deleteChatGroup(groupId);
      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      setJoinedGroup((prev) => (prev?.id === groupId ? null : prev));
    } catch (error) {
      setGroupsError(error.message);
    } finally {
      setDeletingGroupId(null);
    }
  };

  const handleJoinGroup = (group) => {
    setJoinedGroup(group);
  };

  const handleLeaveGroup = () => {
    setJoinedGroup(null);
    fetchGroups();
  };

  return (
    <>
      <section className='w-full space-y-6 text-white'>
        <PageHeader
          title='Chat de Equipos'
          description='Crea grupos, consulta los canales activos y coordina al taller en tiempo real.'
          action={
            <div className='flex gap-3'>
              <Button variant='secondary' onClick={fetchGroups}>
                Actualizar
              </Button>
              <Button onClick={openCreateModal}>Nuevo grupo</Button>
            </div>
          }
        />

        {groupsError ? (
          <Card className='p-4'>
            <p className='text-sm text-red-400'>{groupsError}</p>
          </Card>
        ) : null}

        <div className='grid gap-6 xl:grid-cols-[0.95fr_1.65fr]'>
          <div className='space-y-6'>
            <Card className='overflow-hidden'>
              <div className='border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_38%),#0F172A] px-5 py-5'>
                <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-white/40'>
                  Centro de grupos
                </p>
                <h2 className='mt-3 text-2xl font-bold text-white'>
                  Canales disponibles
                </h2>
                <p className='mt-2 text-sm text-white/55'>
                  Entra en un grupo activo o crea un nuevo espacio para coordinar una incidencia.
                </p>
              </div>

              <div className='space-y-4 p-5'>
                <Input
                  label='Busqueda'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Recepcion, taller, diagnosis...'
                  className='border-white/10 bg-[#111827]'
                />

                <div className='flex items-center justify-between text-sm text-white/45'>
                  <span>{filteredGroups.length} grupo(s)</span>
                  <span>{groups.filter((group) => group.active).length} activo(s)</span>
                </div>

                <div className='space-y-3'>
                  {groupsLoading ? (
                    <div className='rounded-3xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45'>
                      Cargando grupos...
                    </div>
                  ) : filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <article
                        key={group.id}
                        className={`rounded-3xl border p-4 transition ${
                          joinedGroup?.id === group.id
                            ? 'border-blue-500/40 bg-blue-500/10'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className='flex items-start justify-between gap-4'>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-3'>
                              <span
                                className='h-3 w-3 rounded-full'
                                style={{ backgroundColor: group.color }}
                              />
                              <h3 className='text-base font-semibold text-white'>
                                {group.name}
                              </h3>
                            </div>
                            <p className='mt-2 text-sm text-white/55'>
                              {group.description || 'Sin descripcion.'}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              group.active
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {group.active ? 'Activo' : 'En espera'}
                          </span>
                        </div>

                        <div className='mt-4 flex flex-wrap gap-2 text-xs text-white/55'>
                          <span className='rounded-full bg-[#0F172A] px-3 py-1'>
                            {group.memberCount} participante(s)
                          </span>
                          <span className='rounded-full bg-[#0F172A] px-3 py-1'>
                            {group.createdByName || 'Sistema'}
                          </span>
                        </div>

                        <div className='mt-4 flex flex-wrap gap-2'>
                          <Button
                            className='flex-1 min-w-[140px]'
                            onClick={() => handleJoinGroup(group)}
                          >
                            {joinedGroup?.id === group.id ? 'Grupo actual' : 'Conectarme'}
                          </Button>

                          {adminMode ? (
                            <>
                              <Button
                                variant='secondary'
                                onClick={() => openEditModal(group)}
                              >
                                Editar
                              </Button>
                              <Button
                                variant='ghost'
                                onClick={() => handleDeleteGroup(group.id)}
                              >
                                {deletingGroupId === group.id
                                  ? 'Eliminando...'
                                  : 'Eliminar'}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className='rounded-3xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45'>
                      No hay grupos que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div>
            {joinedGroup ? (
              <Chat
                currentUser={currentUser}
                room={joinedGroup}
                onLeave={handleLeaveGroup}
                onRefreshGroups={fetchGroups}
              />
            ) : (
              <Card className='min-h-[72vh] overflow-hidden'>
                <div className='flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),#0F172A] p-8'>
                  <div className='max-w-2xl space-y-4'>
                    <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-white/40'>
                      Preparado para conectar
                    </p>
                    <h2 className='text-4xl font-bold leading-tight text-white'>
                      Elige un grupo y entra directamente en la conversación del taller.
                    </h2>
                    <p className='text-base leading-7 text-white/60'>
                      La lista de la izquierda muestra los canales activos, quién los creó y cuánta gente está conectada ahora mismo. Si necesitas un nuevo espacio de trabajo, créalo y compártelo con el equipo.
                    </p>
                  </div>

                  <div className='grid gap-4 md:grid-cols-3'>
                    <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-5'>
                      <p className='text-sm font-semibold text-white'>Grupos vivos</p>
                      <p className='mt-2 text-3xl font-bold text-white'>
                        {groups.filter((group) => group.active).length}
                      </p>
                      <p className='mt-2 text-sm text-white/45'>
                        Canales con al menos un participante conectado.
                      </p>
                    </div>

                    <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-5'>
                      <p className='text-sm font-semibold text-white'>Tu perfil</p>
                      <p className='mt-2 text-xl font-bold text-white'>
                        {currentUser.name}
                      </p>
                      <p className='mt-2 text-sm text-white/45'>
                        Rol actual: {currentUser.role || 'Sin rol'}
                      </p>
                    </div>

                    <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-5'>
                      <p className='text-sm font-semibold text-white'>Control</p>
                      <p className='mt-2 text-sm leading-6 text-white/50'>
                        {adminMode
                          ? 'Puedes crear, editar y eliminar grupos desde esta vista.'
                          : 'Puedes crear grupos y conectarte a cualquiera de los ya existentes.'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        title={editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
        onClose={closeModal}
        panelClassName='md:min-w-[46vw] max-w-4xl'
      >
        <form onSubmit={handleSubmitGroup} className='space-y-5'>
          {submitError ? (
            <p className='text-sm text-red-400'>{submitError}</p>
          ) : null}

          <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
            <div className='space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Configuración
              </p>

              <Input
                label='Nombre del grupo'
                name='name'
                value={groupForm.name}
                onChange={handleGroupFormChange}
                placeholder='Diagnosis, recambios, guardia...'
              />

              <div>
                <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Descripción
                </label>
                <textarea
                  name='description'
                  rows='4'
                  value={groupForm.description}
                  onChange={handleGroupFormChange}
                  placeholder='Qué se coordina en este grupo y para qué sirve.'
                  className='w-full resize-none rounded-2xl border border-white/5 bg-[#1F2937] px-4 py-3 text-white outline-none placeholder:text-white/25'
                />
              </div>
            </div>

            <div className='space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='text-[11px] font-bold uppercase tracking-widest text-white/40'>
                Identidad visual
              </p>

              <div className='rounded-3xl border border-white/10 bg-[#0F172A] p-5'>
                <div className='flex items-center gap-4'>
                  <span
                    className='h-12 w-12 rounded-2xl border border-white/10'
                    style={{ backgroundColor: groupForm.color }}
                  />
                  <div>
                    <p className='text-white'>{groupForm.name || 'Nuevo grupo'}</p>
                    <p className='text-sm text-white/45'>
                      Color de referencia del canal
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/40'>
                  Color
                </label>
                <input
                  type='color'
                  name='color'
                  value={groupForm.color}
                  onChange={handleGroupFormChange}
                  className='h-14 w-full rounded-2xl border border-white/5 bg-[#1F2937] px-2 py-2'
                />
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
                : editingGroup
                  ? 'Actualizar grupo'
                  : 'Crear grupo'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
