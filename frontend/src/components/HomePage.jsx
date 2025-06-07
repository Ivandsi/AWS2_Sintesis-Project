import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const { user } = useContext(AuthContext);

  if (user) {
    // User is logged in
    return (
      <section className="homepage-container">
        <h1 className="homepage-title">¡Hola, {user.username}{" "}!</h1>
        <p className="homepage-description">It's time to explore games.</p>
      </section>
    );
  }

  // No user logged in, show default welcome message
  return (
    <section className="homepage-container">
      <h1 className="homepage-title">Bienvenido a GameVault</h1>
      <p className="homepage-description">
        En GameVault puedes buscar fácilmente información sobre tus videojuegos favoritos, descubrir nuevos títulos y mantenerte al día con las últimas novedades del mundo gamer.
      </p>
      <p className="homepage-note">
        <strong>Usuarios registrados</strong> también pueden crear y gestionar listas personalizadas de juegos, para organizar y compartir sus colecciones y recomendaciones con la comunidad.
      </p>
    </section>
  );
}
