import React, { useEffect, useState } from "react";
import { getGameReviews } from "../services/api";
import Paginator from "./ui/Paginator"; // Import your paginator component

export default function GameReviews({ gameId, formatDate }) {
  const [reviews, setReviews] = useState({ reviews: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 2;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getGameReviews(
          gameId,
          currentPage,
          REVIEWS_PER_PAGE
        );
        setReviews(data || { reviews: [] });
      } catch (err) {
        setReviews({ reviews: [] });
      } finally {
        setLoading(false);
      }
    };
    if (gameId) fetchReviews();
  }, [gameId, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) return <p>Cargando reseñas...</p>;

  return (
    <div className="right-column-reviews">
      <h3>Reseñas del Juego</h3>
      {reviews && reviews.reviews && reviews.reviews.length > 0 ? (
        <>
          {reviews.reviews.map((review) => (
            <div
              key={review.id}
              className="detail-review-card dashboard-style-review-card"
            >
              {/* ...review content... */}
              <div className="review-header">
                <div className="review-avatar">
                  <img
                    src={
                      review.user_avatar_url ||
                      "https://placehold.co/48x48/4a4a4a/ffffff?text=No+Img"
                    }
                    alt={review.user_username}
                    className="avatar-img"
                  />
                </div>
                <div className="review-user-info">
                  <strong>Reseña de {review.user_username}</strong>
                  <div className="review-rating-date">
                    <span className="review-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < review.rating ? "gold" : "#ccc",
                            fontSize: "1.1em",
                          }}
                        >
                          &#9733;
                        </span>
                      ))}
                    </span>
                    <span className="review-completed-date">
                      Completado el {formatDate(review.completed_on)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="review-body">
                <p>{review.review_text}</p>
              </div>
              <div className="review-actions">
                <span>
                  {review.updated_at && review.updated_at !== review.created_at
                    ? `Editada el ${formatDate(review.updated_at)}`
                    : `Creada el ${formatDate(review.created_at)}`}
                </span>
              </div>
            </div>
          ))}
          {reviews.total_pages > 1 && (
            <Paginator
              page={currentPage}
              totalPages={reviews.total_pages}
              onPageChange={handlePageChange}
              maxVisible={6}
            />
          )}
        </>
      ) : (
        <p>No hay reseñas disponibles para este juego.</p>
      )}
    </div>
  );
}
