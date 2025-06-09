import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom"; // Para obtener el ID del juego de la URL
import {
  addGameToList,
  createReview,
  getGameDetails,
  getGameUserReview,
  getUserLists,
  updateReview,
} from "../services/api"; // Tu función para obtener detalles del juego
import { AuthContext } from "../contexts/AuthContext"; // Si necesitas el token para el API
import "./GameDetailPage.css"; // Archivo CSS para estilizar esta página
import GameReviewsSection from "./GameReviewsSection"; // Componente para mostrar las reseñas del juego
import AddToListModal from "./AddToListModal";
import ReviewModal from "./ReviewModal";

export default function GameDetailPage() {
  const { gameId } = useParams(); // Obtener gameId de la URL (ej: /game/123)
  const { userToken } = useContext(AuthContext); // Si el endpoint de detalles requiere token
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [currentListName, setCurrentListName] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [userReview, setUserReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  const LIST_NAMES = [
    "Jugando",
    "Terminado",
    "En espera",
    "Planificado para jugar",
  ];

  // Define fetchCurrentList OUTSIDE useEffect
  const fetchCurrentList = async () => {
    if (!userToken || !gameId) return;
    try {
      const lists = await getUserLists(userToken);
      const found = lists.find((list) =>
        list.games.some((g) => String(g.id) === String(gameId))
      );
      setCurrentListName(found ? found.name : "");
      setSelectedList(found ? found.name : "");
    } catch (err) {
      setCurrentListName("");
      setSelectedList("");
    }
  };

  const handleAddToList = async () => {
    try {
      await addGameToList(selectedList, game.id, userToken);
      alert("Juego añadido a la lista correctamente.");
      await fetchCurrentList(); // Ensure backend is updated before fetching
    } catch (err) {
      alert(err.message || "No se pudo añadir el juego a la lista.");
    } finally {
      setShowListModal(false);
      // Do NOT reset selectedList here
    }
  };

  // Reset selection to the original list before closing
  const handleCancelAddToList = () => {
    setSelectedList(currentListName || "");
    setShowListModal(false)
  };

  // When opening the modal, always set selectedList to currentListName
  const openListModal = () => {
    setSelectedList(currentListName || "");
    setShowListModal(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (userReview) {
        await updateReview(game.id, reviewData, userToken);
        alert("Reseña actualizada.");
      } else {
        await createReview(game.id, reviewData, userToken);
        alert("Reseña creada.");
      }
      setShowReviewModal(false);
      setReviewsRefreshKey((k) => k + 1); // <--- Add this line
    } catch (err) {
      alert(err.message || "No se pudo guardar la reseña.");
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const data = await getGameDetails(gameId);
        setGame(data);
      } catch (err) {
        setError(err.message);
        console.error("Error al obtener detalles del juego:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserReview = async () => {
      if (!userToken || !gameId) return;
      try {
        const review = await getGameUserReview(gameId, userToken);
        setUserReview(review && review.id ? review : null);
      } catch (err) {
        setUserReview(null);
      }
    };

    if (gameId) {
      fetchGame();
      fetchCurrentList();
      fetchUserReview();
    }
  }, [gameId, userToken]);

  if (loading) {
    return (
      <section className="game-detail-container status-text">
        Cargando detalles del juego...
      </section>
    );
  }

  if (error) {
    return (
      <section className="game-detail-container status-text">
        Error: {error}. No se pudieron cargar los detalles del juego.
      </section>
    );
  }

  if (!game) {
    return (
      <section className="game-detail-container status-text">
        Juego no encontrado.
      </section>
    );
  }

  // Helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="game-detail-container">
      <div className="game-header">
        <div className="game-cover">
          {game.cover_image_url ? (
            <img
              src={game.cover_image_url}
              alt={game.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="no-cover-placeholder">
              <span className="placeholder-text">Sin portada</span>
            </div>
          )}
        </div>
        <div className="game-info">
          <h1 className="game-title">{game.title}</h1>
          <p className="game-release-info">
            Lanzado el {formatDate(game.release_date)} por{" "}
            {game.developer ? game.developer.name : "Desconocido"}
            {game.publisher && ` (Publicado por ${game.publisher.name})`}
          </p>
          <p className="game-description">{game.description}</p>

          <div className="game-stats-buttons">
            <div className="rating-stars-display">
              {/* Aquí podrías mostrar la calificación promedio con estrellas */}
              {game.average_rating ? (
                <span className="avg-rating">
                  {game.average_rating.toFixed(1)}
                </span>
              ) : (
                <span className="avg-rating">N/A</span>
              )}
              <div className="star-icons">
                {/* Ejemplo: Generar estrellas basadas en average_rating */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="star-icon"
                    style={{
                      color:
                        i < Math.floor(game.average_rating) ? "gold" : "#ccc",
                    }}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
            </div>
            {userToken && (
              <>
                <button className="btn-add-to-lists" onClick={openListModal}>
                  {currentListName ? "Editar lista" : "Añadir a lista"}
                </button>
                <button
                  className="btn-add-to-lists"
                  onClick={() => setShowListModal(true)}
                >
                  {currentListName ? "Editar lista" : "Añadir a lista"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="game-details-sections">
        <div className="left-column-details">
          <h3>Información del Juego</h3>
          <p>
            <strong>Desarrollador:</strong>{" "}
            {game.developer ? game.developer.name : "N/A"}
          </p>
          <p>
            <strong>Editor:</strong>{" "}
            {game.publisher ? game.publisher.name : "N/A"}
          </p>
          <p>
            <strong>Fecha de lanzamiento:</strong>{" "}
            {formatDate(game.release_date)}
          </p>
          <p>
            <strong>Franquicia:</strong>{" "}
            {game.franchise ? game.franchise.name : "N/A"}
          </p>
          <p>
            <strong>Clasificación ESRB:</strong> {game.esrb_rating || "N/A"}
          </p>
          <p>
            <strong>Soporte Multijugador:</strong>{" "}
            {game.multiplayer_support ? "Sí" : "No"}
          </p>
          <p>
            <strong>Tiempo jugado (horas):</strong> {game.time_played || 0}
          </p>

          <p>
            <strong>Plataformas:</strong>{" "}
            {game.platforms && game.platforms.length > 0
              ? game.platforms.map((p) => p.name).join(", ")
              : "N/A"}
          </p>
          <p>
            <strong>Géneros:</strong>{" "}
            {game.genres && game.genres.length > 0
              ? game.genres.map((g) => g.name).join(", ")
              : "N/A"}
          </p>
          <p>
            <strong>Etiquetas:</strong>{" "}
            {game.tags && game.tags.length > 0
              ? game.tags.map((t) => t.name).join(", ")
              : "N/A"}
          </p>

          <div className="game-social-stats">
            <p>
              <strong>{game.num_ratings || 0} Calificaciones</strong>
            </p>
            <p>
              <strong>{game.num_reviews || 0} Reseñas</strong>
            </p>
            {/* Puedes añadir más stats como Likes, Lists si tu backend los proporciona */}
          </div>
        </div>

        <GameReviewsSection
          key={reviewsRefreshKey}
          gameId={gameId}
          formatDate={formatDate}
        />
      </div>

      {/* Sección de Logros (Achievements) si tu modelo Game.achievements está poblado */}
      {game.achievements && game.achievements.length > 0 && (
        <div className="achievements-section">
          <h3>Logros</h3>
          <div className="achievements-grid">
            {game.achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showListModal && (
        <AddToListModal
          show={showListModal}
          listNames={LIST_NAMES}
          selectedList={selectedList}
          setSelectedList={setSelectedList}
          onAdd={handleAddToList}
          onClose={handleCancelAddToList}
          // Pass the currentListName to the modal
          currentListName={currentListName}
        />
      )}
      {showReviewModal && (
        <ReviewModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          initialReview={userReview || {}}
        />
      )}
    </section>
  );
}
