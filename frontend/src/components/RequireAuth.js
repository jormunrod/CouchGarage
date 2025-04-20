import React from 'react';
import { Navigate } from 'react-router-dom';

function RequireAuth({ user, children }) {
  if (user === undefined) {
    return <div className="loading">Cargando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;