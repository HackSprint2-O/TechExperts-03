import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
    // Start a new chat by default
    startNewChat();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    setInput('');
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const saveCurrentChat = () => {
    if (messages.length > 0) {
      const updatedHistory = chatHistory.filter(c => c.id !== currentChatId);
      const newChat = {
        id: currentChatId,
        title: messages[0]?.text.slice(0, 30) + '...' || 'New Chat',
        messages: messages,
        timestamp: new Date().toISOString()
      };
      updatedHistory.unshift(newChat); // Add to beginning
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    // Call backend API
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, user_email: 'user@example.com' }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorData = await response.json();
        const errorMessage = {
          text: `Error: ${errorData.error || 'Failed to get response'}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        text: `Error: ${error.message}`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      saveCurrentChat();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.branding}>
          <h1 style={styles.brandTitle}>EduBot</h1>
        </div>
        <button style={styles.newChatBtn} onClick={startNewChat}>
          + New Chat
        </button>
        <div style={styles.history}>
          <h3 style={styles.historyTitle}>Chat History</h3>
          {chatHistory.map(chat => (
            <div
              key={chat.id}
              style={{
                ...styles.historyItem,
                backgroundColor: currentChatId === chat.id ? '#e3f2fd' : 'transparent'
              }}
              onClick={() => loadChat(chat.id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Chat Area */}
      <div style={styles.chatArea}>
        <div style={styles.header}>
          <h2 style={styles.chatTitle}>Chat with EduBot</h2>
        </div>

        <div style={styles.messagesContainer}>
          {messages.length === 0 && (
            <div style={styles.welcomeMessage}>
              <h3>Welcome to EduBot!</h3>
              <p>Ask me anything about your studies. I'm here to help!</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f1f1',
                color: msg.sender === 'user' ? 'white' : 'black',
                animation: 'fadeIn 0.5s ease-in'
              }}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ ...styles.message, alignSelf: 'flex-start', backgroundColor: '#f1f1f1' }}>
              <div style={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <textarea
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows={3}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
            Send
          </button>
        </div>
      </div>


    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Poppins', sans-serif",
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e9ecef',
  },
  branding: {
    marginBottom: '20px',
  },
  brandTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4285F4',
    margin: 0,
  },
  newChatBtn: {
    padding: '10px 15px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  history: {
    flex: 1,
    overflowY: 'auto',
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  historyItem: {
    padding: '8px 10px',
    marginBottom: '5px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s',
  },
  logoutBtn: {
    padding: '10px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: 'auto',
    transition: 'background-color 0.3s',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e9ecef',
  },
  chatTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#666',
    marginTop: '50px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '18px',
    marginBottom: '10px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  'typingIndicator span': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#999',
    animation: 'typing 1.4s infinite ease-in-out',
  },
  inputArea: {
    padding: '20px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: '10px',
  },
  textarea: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    resize: 'none',
    fontFamily: 'inherit',
    fontSize: '16px',
  },
  sendBtn: {
    padding: '12px 20px',
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
};

export default ChatPage;
