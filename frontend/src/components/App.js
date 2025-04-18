import React, { useState, useEffect } from 'react';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import '../styles/App.css';
import car from '../assets/images/car.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/protected`, { credentials: 'include' })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.name) {
            setUser({ username: data.user.name });
          }
        }
      })
      .catch((error) => {
        console.log("No hay sesión activa", error);
      });
  }, []);

  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register setView={setView} />;
      case 'login':
        return <Login setView={setView} setUser={setUser} />;
      default:
        return <Home setView={setView} user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={car} className="App-logo" alt="logo" />
        <p>Welcome to CouchGarage</p>
        {renderView()}
      </header>
    </div>
  );
}

export default App;