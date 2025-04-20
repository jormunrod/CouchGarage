import React from 'react';
import LogoutButton from './LogoutButton';

const Home = ({ setView, user, setUser, fetchUser }) => (
  <div>
    {user ? (
      <>
        <p>Hello, {user.username}. You are logged in!</p>
        <LogoutButton setUser={setUser} setView={setView} fetchUser={fetchUser} />
      </>
    ) : (
      <>
        <button onClick={() => setView('register')}>Register</button>
        <button onClick={() => setView('login')}>Login</button>
      </>
    )}
  </div>
);

export default Home;