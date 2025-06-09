import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { logIn } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

const LoginPage = () => {
  const { login, user, userToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user || userToken) {
      navigate("/");
    }
  }, [user, userToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = await logIn(formData.email, formData.password);
      login(token);
      navigate("/");
    } catch (err) {
      setError("Error al iniciar sesión. Por favor verifica tus credenciales.");
      console.error(err);
    }
  };

  return (
    <main className="login-main">
        <div className="login-container">
          <h1>Iniciar sesión</h1>
          <p>Accede para gestionar tus listas y buscar videojuegos.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="btn btn-default">
              Entrar
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <p className="register-prompt">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="register-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
    </main>
  );
};

export default LoginPage;
