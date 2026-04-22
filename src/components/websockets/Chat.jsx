import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../ui/Button';

const API_HTTP_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CHAT_SOCKET_URL =
  import.meta.env.VITE_CHAT_WS_URL ||
  `${API_HTTP_URL.replace(/^http/i, 'ws').replace(/\/api$/, '')}/ws/chat`;

const formatTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

function Chat({ currentUser, room, onLeave, onRefreshGroups }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionState, setConnectionState] = useState('connecting');
  const [roomState, setRoomState] = useState(room);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setRoomState(room);
    setConnectionState('connecting');

    const websocket = new WebSocket(CHAT_SOCKET_URL);
    socketRef.current = websocket;

    websocket.onopen = () => {
      setConnectionState('connected');
      websocket.send(
        JSON.stringify({
          type: 'join',
          groupId: room.id,
          userId: currentUser.id,
          username: currentUser.name,
        }),
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'joined' || data.type === 'group_state') {
        if (data.group) {
          setRoomState(data.group);
          onRefreshGroups?.();
        }
        return;
      }

      if (data.type === 'group_deleted') {
        onRefreshGroups?.();
        onLeave();
        return;
      }

      if (data.type === 'error') {
        setMessages((prev) => [
          ...prev,
          {
            type: 'system',
            message: data.message,
            timeStamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, data]);
    };

    websocket.onerror = () => {
      setConnectionState('error');
    };

    websocket.onclose = () => {
      setConnectionState('closed');
      onRefreshGroups?.();
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'leave' }));
      }
      websocket.close();
    };
  }, [currentUser.id, currentUser.name, room.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const members = useMemo(() => roomState?.members ?? [], [roomState]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextMessage = inputMessage.trim();
    const socket = socketRef.current;

    if (!nextMessage || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'message',
        username: currentUser.name,
        message: nextMessage,
      }),
    );
    setInputMessage('');
  };

  const handleLeave = () => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'leave' }));
      socket.close();
    }

    onLeave();
  };

  return (
    <div className='grid gap-5 xl:grid-cols-[1.65fr_0.75fr]'>
      <section className='overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl'>
        <div className='flex flex-col gap-4 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_38%),#0F172A] px-6 py-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <span
                className='h-3 w-3 rounded-full shadow-[0_0_24px_currentColor]'
                style={{ backgroundColor: room.color, color: room.color }}
              />
              <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-white/45'>
                Sala activa
              </p>
            </div>

            <h2 className='text-2xl font-bold text-white'>{roomState?.name}</h2>
            <p className='max-w-2xl text-sm text-white/65'>
              {roomState?.description || 'Sin descripcion.'}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <span className='rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70'>
              {connectionState === 'connected'
                ? 'Conectado'
                : connectionState === 'connecting'
                  ? 'Conectando...'
                  : 'Desconectado'}
            </span>
            <Button variant='secondary' onClick={handleLeave}>
              Salir del grupo
            </Button>
          </div>
        </div>

        <div className='flex h-[62vh] flex-col'>
          <div className='flex-1 overflow-y-auto px-6 py-5'>
            <div className='space-y-4'>
              {messages.length === 0 ? (
                <div className='rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/45'>
                  El canal esta listo. Escribe el primer mensaje para arrancar la conversación.
                </div>
              ) : null}

              {messages.map((msg, index) =>
                msg.type === 'system' ? (
                  <div key={`${msg.timeStamp}-${index}`} className='text-center'>
                    <span className='inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/45'>
                      {msg.message}
                    </span>
                  </div>
                ) : (
                  <div
                    key={`${msg.timeStamp}-${index}`}
                    className={`flex ${
                      msg.username === currentUser.name ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <article
                      className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-lg ${
                        msg.username === currentUser.name
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/10 bg-white/[0.04] text-white'
                      }`}
                    >
                      <div className='mb-1 flex items-center gap-2 text-xs'>
                        <span
                          className={
                            msg.username === currentUser.name
                              ? 'text-white/70'
                              : 'text-white/55'
                          }
                        >
                          {msg.username}
                        </span>
                        <span
                          className={
                            msg.username === currentUser.name
                              ? 'text-white/50'
                              : 'text-white/35'
                          }
                        >
                          {formatTime(msg.timeStamp)}
                        </span>
                      </div>
                      <p className='whitespace-pre-wrap text-sm leading-6'>
                        {msg.message}
                      </p>
                    </article>
                  </div>
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className='border-t border-white/10 bg-[#0F172A] px-6 py-5'
          >
            <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-3'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
                <div className='flex-1'>
                  <label className='mb-2 block text-[11px] font-bold uppercase tracking-widest text-white/35'>
                    Mensaje
                  </label>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    rows='3'
                    placeholder='Comparte una actualización, una incidencia o una petición rápida...'
                    className='w-full resize-none rounded-2xl border border-white/5 bg-[#1F2937] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25'
                  />
                </div>

                <div className='flex shrink-0 flex-col gap-2 lg:w-44'>
                  <Button type='submit' className='w-full'>
                    Enviar
                  </Button>
                  <p className='text-xs text-white/35'>
                    Los mensajes llegan en tiempo real al grupo activo.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <aside className='space-y-5'>
        <section className='rounded-3xl border border-white/10 bg-[#111827] p-5'>
          <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-white/40'>
            Contexto
          </p>
          <div className='mt-4 space-y-3 text-sm text-white/70'>
            <p>
              <span className='text-white'>Usuario:</span> {currentUser.name}
            </p>
            <p>
              <span className='text-white'>Miembros activos:</span>{' '}
              {roomState?.memberCount ?? 0}
            </p>
            <p>
              <span className='text-white'>Estado:</span>{' '}
              {roomState?.active ? 'Sala activa' : 'Sala sin participantes'}
            </p>
          </div>
        </section>

        <section className='rounded-3xl border border-white/10 bg-[#111827] p-5'>
          <div className='flex items-center justify-between'>
            <p className='text-[11px] font-bold uppercase tracking-[0.24em] text-white/40'>
              Participantes
            </p>
            <span className='rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/55'>
              {members.length}
            </span>
          </div>

          <div className='mt-4 space-y-3'>
            {members.length > 0 ? (
              members.map((member) => (
                <div
                  key={`${member.userId}-${member.username}`}
                  className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3'
                >
                  <div>
                    <p className='text-sm text-white'>{member.username}</p>
                    <p className='text-xs text-white/40'>
                      {member.userId === currentUser.id ? 'Tú' : 'Conectado'}
                    </p>
                  </div>
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />
                </div>
              ))
            ) : (
              <div className='rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/40'>
                Todavía no hay participantes en esta sala.
              </div>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

export default Chat;
