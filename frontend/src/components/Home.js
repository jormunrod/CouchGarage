import React from 'react';

const Home = ({ user }) => (
  <div>
    {user
      ? <p>¡Has iniciado sesión!</p>
      : <p>¡Bienvenido a CouchGarage! Por favor, inicia sesión o regístrate para acceder a todas las funciones.</p>
    }
  </div>
);

export default Home;