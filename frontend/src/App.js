import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7));
    fetchRooms();
  }, []);
  

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: input,
        sessionId: sessionId,
      });

      const botMessage = { role: 'assistant', content: response.data.response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="App">
      <nav className='navbar'>
        <a className='hs'>
          Hotel Booking Chatbot
        </a>
      </nav>
     
      <div className="content">
        <div className="room-list">
          {rooms.map((room, index) => (
            <div key={room.id} className="room-item">
              <h3>{index + 1}. {room.name}</h3>
              <p>Price: ₹{room.price} per night</p>
              <p>Description: {room.description}</p>
            </div>
          ))}
        </div>
        <div className="chat-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;