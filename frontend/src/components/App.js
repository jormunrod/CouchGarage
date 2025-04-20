import React, { useState, useEffect, useCallback } from 'react';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Navbar from './Navbar';
import '../styles/App.css';
import car from '../assets/images/car.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(undefined);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/protected`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.name) {
          setUser({ username: data.user.name });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register setView={setView} />;
      case 'login':
        return <Login setView={setView} fetchUser={fetchUser} />;
      default:
        return <Home user={user} />;
    }
  };

  return (
    <div className="App">
      <Navbar user={user} setView={setView} setUser={setUser} fetchUser={fetchUser} />
      <header className="App-header">
        <img src={car} className="App-logo" alt="logo" />
        <p>Welcome to CouchGarage</p>
        {user === undefined ? <p>Loading...</p> : renderView()}
      </header>
    </div>
  );
}

export default App;