import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import "./RegisterPage.css";
import { AuthContext } from "../contexts/AuthContext"; // Adjust the path if needed

const RegisterPage = () => {
  const { userToken } = useContext(AuthContext); // or use `user` if available
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (userToken) {
      navigate("/"); // Redirect if already logged in
    }
  }, [userToken, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registration logic here
    alert("Registro enviado");
  };

  return (
    <main className="register-page">
      <h1>Crear una cuenta</h1>
      <form onSubmit={handleSubmit} className="register-form">
        {/* form inputs here as before */}
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
