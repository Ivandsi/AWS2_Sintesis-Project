import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getTrendingGames } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import UserDashboard from "./UserDashboardPage";
import "./HomePage.css";

export default function HomePage() {
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const games = await getTrendingGames();
        setTrendingGames(games);
      } catch {
        setTrendingGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  if (user) {
    return <UserDashboard />;
  }

  return (
    <section className="home-container">
      <h1 className="home-title">Bienvenido a tu biblioteca de juegos</h1>
      <p className="home-description">
        Descubre, organiza y reseña tus videojuegos favoritos.
        <br />
        En <b>GameVault</b> puedes buscar información sobre tus juegos
        favoritos, descubrir nuevos títulos y mantenerte al día con las
        novedades del mundo gamer.
        <br />
        Los usuarios registrados pueden crear y gestionar listas personalizadas
        para organizar y compartir sus colecciones y recomendaciones con la
        comunidad.
      </p>

      <div className="recent-section">
        <div className="recent-header-row">
          <h2>Juegos añadidos recientemente</h2>
          <button
            className="home-see-all-btn"
            onClick={() => navigate("/search")}
          >
            Ver todos los juegos
          </button>
        </div>
        <hr className="home-section-divider" />
        {loading ? (
          <p className="home-loading">Cargando juegos...</p>
        ) : trendingGames.length > 0 ? (
          <div className="home-game-grid">
            {trendingGames.map((game) => (
              <div
                className="home-game-card"
                key={game.id}
                onClick={() => handleGameClick(game.id)}
              >
                <div className="home-game-cover">
                  {game.cover_image_url ? (
                    <img src={game.cover_image_url} alt={game.title} />
                  ) : (
                    <div className="home-no-cover-placeholder">
                      <span className="home-placeholder-text">Sin Portada</span>
                    </div>
                  )}
                </div>
                <div className="home-game-card-title">{game.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="home-empty">No hay juegos recientes para mostrar.</p>
        )}
      </div>
    </section>
  );
}
