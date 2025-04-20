import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import Navbar from "./Navbar";
import CreateMaintenance from "./CreateMaintenance";
import UserMaintenances from "./UserMaintenances";
import RequireAuth from "./RequireAuth";
import About from "./About";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function App() {
  const [user, setUser] = useState(undefined);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/protected`, {
        credentials: "include",
      });
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

  return (
    <Router>
      <div>
        <Navbar user={user} fetchUser={fetchUser} setUser={setUser} />
        <Routes>
          <Route
            path="/"
            element={
              user === undefined ? (
                <div className="App-header">
                  <p>Cargando...</p>
                </div>
              ) : (
                <Home user={user} />
              )
            }
          />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<Login fetchUser={fetchUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/maintenances/create"
            element={
              <RequireAuth user={user}>
                <CreateMaintenance user={user} />
              </RequireAuth>
            }
          />
          <Route
            path="/maintenances/mine"
            element={
              <RequireAuth user={user}>
                <UserMaintenances />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
