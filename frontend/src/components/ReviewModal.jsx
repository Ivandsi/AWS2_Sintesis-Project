import React, { useState } from "react";

export default function ReviewModal({
  show,
  onClose,
  onSubmit,
  initialReview = {},
}) {
  const [reviewText, setReviewText] = useState(initialReview.review_text || "");
  const [rating, setRating] = useState(initialReview.rating || 0);
  const [completedOn, setCompletedOn] = useState(
    initialReview.completed_on || ""
  );

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialReview.id ? "Editar reseña" : "Nueva reseña"}</h3>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Escribe tu reseña..."
          rows={5}
          style={{ width: "100%" }}
        />
        <div style={{ margin: "1em 0" }}>
          <label>Calificación: </label>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                cursor: "pointer",
                color: star <= rating ? "gold" : "#ccc",
                fontSize: "1.5em",
              }}
              onClick={() => setRating(star)}
            >
              &#9733;
            </span>
          ))}
        </div>
        <div>
          <label>
            Fecha completado:{" "}
            <input
              type="date"
              value={completedOn}
              onChange={(e) => setCompletedOn(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: "1em" }}>
          <button
            onClick={() =>
              onSubmit({
                review_text: reviewText,
                rating,
                completed_on: completedOn,
              })
            }
            disabled={!reviewText || !rating || !completedOn}
          >
            Guardar
          </button>
          <button style={{ marginLeft: "1em" }} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
