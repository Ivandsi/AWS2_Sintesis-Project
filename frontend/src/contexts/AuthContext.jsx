import React, { createContext, useState, useEffect } from "react";
import { getUserInfo } from "../services/api";
import { API_URL } from "../services/api";

export const AuthContext = createContext({
  user: null, // Información del usuario logueado
  login: () => {}, // Función para iniciar sesión
  logout: () => {}, // Función para cerrar sesión
  setActiveComponent: () => {}, // Función para cambiar el componente activo
  setUserToken: () => {}, // set token de usuario
  userToken: null, // token de usuario
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [activeComponent, setActiveComponent] = useState("UserDetails");

  // Cargar el token y el usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUserToken(token);
      fetchUserInfo(token); // Obtener la información del usuario
    }
  }, []);

  // Función para obtener la información del usuario
  const fetchUserInfo = async (token) => {
    try {
      const userInfo = await getUserInfo(token);

      // Save the whole user object directly
      setUser(userInfo);
    } catch (err) {
      console.error(
        "Error al obtener la información del usuario:",
        err.message
      );
      logout(); // Si hay un error, cerrar sesión
    }
  };

  // Función para iniciar sesión
  const login = (token) => {
    localStorage.setItem("token", token); // Guardar el token en localStorage
    setUserToken(token); // Actualizar el estado del token
    fetchUserInfo(token); // Obtener la información del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    window.location.reload();
    localStorage.removeItem("token");
    setUser(null);
    setUserToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        activeComponent,
        setActiveComponent,
        userToken,
        setUserToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
