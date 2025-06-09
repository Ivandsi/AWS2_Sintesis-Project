import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { AuthContext } from "../contexts/AuthContext";
import { register } from "../services/api";

const RegisterPage = () => {
  const { userToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userToken) {
      navigate("/");
    }
  }, [userToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    register(formData, navigate);
  };

  return (
    <main className="register-page">
      <h1>Crear una cuenta</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Nombre de usuario
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Correo electrónico
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirmar contraseña
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn btn-default">
          Registrarse
        </button>
      </form>

      <p className="register-login-link">
        ¿Ya tienes una cuenta?{" "}
        <Link to="/login" className="link">
          Inicia sesión aquí
        </Link>
        .
      </p>
    </main>
  );
};

export default RegisterPage;