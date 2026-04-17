import { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css';

function Chat({ username, room, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3001');

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      websocket.send(
        JSON.stringify({
          type: 'join',
          username,
          room,
        }),
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [username, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'message',
          message: inputMessage.trim(),
        }),
      );
      setInputMessage('');
    }
  };

  const handleLeave = () => {
    if (ws) {
      ws.close();
    }
    onLeave();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.room}>Room: {room}</h2>
          <p className={styles.username}>You: {username}</p>
        </div>
        <button onClick={handleLeave} className={styles.leaveButton}>
          Leave Room
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.type === 'system'
                ? styles.systemMessage
                : msg.username === username
                  ? styles.myMessage
                  : styles.otherMessage
            }
          >
            {msg.type === 'system' ? (
              <span className={styles.systemText}>{msg.message}</span>
            ) : (
              <>
                <span className={styles.messageUsername}>{msg.username}</span>
                <span className={styles.messageText}>{msg.message}</span>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type='text'
          placeholder='Type a message...'
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className={styles.input}
        />
        <button type='submit' className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
