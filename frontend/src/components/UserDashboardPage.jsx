import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import {
  getUserDashboardStats,
  getTrendingGames,
  getPopularReviews,
  getUserInfo,
} from "../services/api";
import "./UserDashboardPage.css"; // Asegúrate de que tu CSS esté enlazado

export default function UserDashboardPage() {
  const { user, userToken } = useContext(AuthContext);
  const [userStats, setUserStats] = useState(null);
  const [trendingGames, setTrendingGames] = useState([]);
  const [popularReviews, setPopularReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardUser, setDashboardUser] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userToken) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userInfoFromAPI = await getUserInfo(userToken);
        // Si no se obtiene información del usuario desde la API, usar el usuario actual
        if (!userInfoFromAPI) {
          window.location.reload(); // Recargar la página para obtener el usuario actualizado
          return;
        }
        setDashboardUser(userInfoFromAPI || user);

        const statsData = await getUserDashboardStats(userToken);
        setUserStats(statsData);

        const trendingData = await getTrendingGames(userToken);
        setTrendingGames(trendingData);

        const reviewsData = await getPopularReviews(userToken);
        setPopularReviews(reviewsData);
      } catch (err) {
        console.error("Error al obtener los datos del panel:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userToken, user]);

  if (loading) {
    return (
      <section className="user-dashboard-container">
        Cargando panel de usuario...
      </section>
    );
  }

  if (error) {
    return (
      <section className="user-dashboard-container">
        Error: {error}. Por favor, inténtalo de nuevo.
      </section>
    );
  }

  if (!dashboardUser || !dashboardUser.username) {
    return (
      <section className="user-dashboard-container">
        Por favor, inicia sesión para ver tu panel.
      </section>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("es-ES", options);
  };

  const handleGameCardClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const goToAdminPanel = () => {
    const { origin, port } = window.location;
    let adminUrl;
    if (port) {
      adminUrl = origin.replace(`:${port}`, ":8000") + "/admin";
      window.location.href = adminUrl;
    } else {
      navigate("/admin");
    }
  };

  return (
    <section className="user-dashboard-container">
      <h1 className="dashboard-welcome">¡Hola, {dashboardUser.username}!</h1>
      <p className="dashboard-description">Tu colección te espera...</p>

      {/* Sección de Estadísticas */}
      <div className="stats-section">
        <div
          className="stat-item"
          onClick={() => userStats?.played > 0 && navigate(`/list/played`)}
          style={{
            cursor: userStats?.played > 0 ? "pointer" : "default",
            opacity: userStats?.played > 0 ? 1 : 0.5,
          }}
          title={userStats?.played > 0 ? "Ver lista" : "Lista vacía"}
        >
          <span className="stat-number">{userStats?.played ?? 0}</span>
          <span className="stat-label">Terminado</span>
        </div>
        <div
          className="stat-item"
          onClick={() => userStats?.playing > 0 && navigate(`/list/playing`)}
          style={{
            cursor: userStats?.playing > 0 ? "pointer" : "default",
            opacity: userStats?.playing > 0 ? 1 : 0.5,
          }}
          title={userStats?.playing > 0 ? "Ver lista" : "Lista vacía"}
        >
          <span className="stat-number">{userStats?.playing ?? 0}</span>
          <span className="stat-label">Jugando</span>
        </div>
        <div
          className="stat-item"
          onClick={() => userStats?.backlog > 0 && navigate(`/list/backlog`)}
          style={{
            cursor: userStats?.backlog > 0 ? "pointer" : "default",
            opacity: userStats?.backlog > 0 ? 1 : 0.5,
          }}
          title={userStats?.backlog > 0 ? "Ver lista" : "Lista vacía"}
        >
          <span className="stat-number">{userStats?.backlog ?? 0}</span>
          <span className="stat-label">En espera</span>
        </div>
        <div
          className="stat-item"
          onClick={() => userStats?.wishlist > 0 && navigate(`/list/wishlist`)}
          style={{
            cursor: userStats?.wishlist > 0 ? "pointer" : "default",
            opacity: userStats?.wishlist > 0 ? 1 : 0.5,
          }}
          title={userStats?.wishlist > 0 ? "Ver lista" : "Lista vacía"}
        >
          <span className="stat-number">{userStats?.wishlist ?? 0}</span>
          <span className="stat-label">Planificado para jugar</span>
        </div>
        {/* Reseñas and Listas: just stats, not clickable */}
        <div className="stat-item">
          <span className="stat-number">{userStats?.reviews ?? 0}</span>
          <span className="stat-label">Reseñas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{userStats?.lists ?? 0}</span>
          <span className="stat-label">Listas</span>
        </div>
      </div>

      {(dashboardUser?.is_superuser ||
        dashboardUser?.groups?.includes("Administrador")) && (
        <>
          <div className="section-header">
            <h2>Zona de administración</h2>
          </div>
          <div className="admin-section">
            <button
              className="admin-button"
              style={{ marginRight: "1rem" }}
              onClick={goToAdminPanel}
            >
              Ir al panel de administración
            </button>
            <button
              className="admin-button"
              onClick={() => navigate("/games/new")}
            >
              Añadir nuevo videojuego
            </button>
          </div>
        </>
      )}

      {/* Sección "Recientemente en tendencia" */}
      <div className="section-header">
        <h2>Juegos añadidos recientemente</h2>
        <button className="see-more-button" onClick={() => navigate("/games")}>
          Ver más
        </button>
      </div>
      <div className="dashboard-game-grid">
        {trendingGames.length > 0 ? (
          trendingGames.map((game) => (
            <div
              className="dashboard-game-card"
              key={game.id}
              onClick={() => handleGameCardClick(game.id)}
            >
              <div className="dashboard-game-cover">
                {game.cover_image_url ? (
                  <img src={game.cover_image_url} alt={game.title} />
                ) : (
                  <div className="dashboard-no-cover-placeholder">
                    <span className="dashboard-placeholder-text">
                      Sin Portada
                    </span>
                  </div>
                )}
              </div>
              <p className="dashboard-game-card-title">{game.title}</p>
            </div>
          ))
        ) : (
          <p>No hay juegos en tendencia para mostrar.</p>
        )}
      </div>

      {/* Sección "Reseñas populares" */}
      <div className="section-header">
        <h2>Reseñas populares</h2>
      </div>
      <div className="reviews-list">
        {popularReviews.length > 0 ? (
          popularReviews.map((review) => (
            <div className="review-card" key={review.id}>
              {review.game?.cover_image_url ? (
                <img
                  src={review.game.cover_image_url}
                  alt={review.game.title}
                  className="review-thumbnail"
                />
              ) : (
                <div className="no-cover-placeholder review-thumbnail">
                  {" "}
                  {/* Usar el mismo placeholder estilizado */}
                  <span className="placeholder-text-small">No Img</span>
                </div>
              )}
              <div className="review-content">
                <h3>
                  {review.user_username} reseñó{" "}
                  {review.game?.title || "Juego Desconocido"}
                </h3>
                <p className="game-meta">
                  <span className="stars">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>&#9733;</span>
                    ))}
                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                      <span key={`empty-${i}`}>&#9734;</span>
                    ))}
                  </span>
                  {review.completed_on &&
                    ` Completado el ${formatDate(review.completed_on)}`}
                </p>
                <p className="review-text">
                  {review.review_text && review.review_text.length > 200
                    ? `${review.review_text.substring(0, 200)}...`
                    : review.review_text}
                </p>
                <div className="review-actions">
                  <span>
                    {review.updated_at &&
                    review.updated_at !== review.created_at
                      ? `Editada el ${formatDate(review.updated_at)}`
                      : `Creada el ${formatDate(review.created_at)}`}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No hay reseñas populares para mostrar.</p>
        )}
      </div>
    </section>
  );
}
