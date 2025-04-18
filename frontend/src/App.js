import React, { useState } from 'react';
import car from './images/car.png';
import './App.css';

// Get the base API URL from the environment variable.
// In create-react-app, required env variables must start with REACT_APP_
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function App() {
  const [view, setView] = useState('home'); // Manages the current view (home, register, login)
  const [user, setUser] = useState(null);

  const renderView = () => {
    switch (view) {
      case 'register':
        return <Register setView={setView} />;
      case 'login':
        return <Login setView={setView} setUser={setUser} />;
      default:
        return <Home setView={setView} user={user} />;
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

// Home Component
const Home = ({ setView, user }) => (
  <div>
    {user ? (
      <p>Hello, {user.username}. You are logged in!</p>
    ) : (
      <>
        <button onClick={() => setView('register')}>Register</button>
        <button onClick={() => setView('login')}>Login</button>
      </>
    )}
  </div>
);

// Register Component
const Register = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert('User registered successfully');
        setView('login'); // Redirect to login after registering
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert('Error registering user');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      <button type="button" onClick={() => setView('home')}>
        Back
      </button>
    </form>
  );
};

// Login Component
const Login = ({ setView, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Login successful');
        setUser({ username }); // Save the user in state
        setView('home'); // Redirect to home after login
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error} - ${errorData.details || ''}`);
      }
    } catch (error) {
      alert('Error logging in');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      <button type="button" onClick={() => setView('home')}>
        Back
      </button>
    </form>
  );
};

export default App;