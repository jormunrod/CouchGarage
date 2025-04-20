import React from 'react';

const Home = ({ user }) => (
  <div>
    {user
      ? <p>You are logged in!</p>
      : <p>Please login or register to continue.</p>
    }
  </div>
);

export default Home;