import React from "react";
import "./ConfirmationModal.css"; // Import modal styles

function ConfirmationModal({ show, message, confirmText, onConfirm, onClose }) {
  if (!show) return null; // Don't render if not visible

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirmation</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
