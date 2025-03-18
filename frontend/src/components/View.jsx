import { useState } from "react";
import "./View.css";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal

function View({ data, onEdit, onDelete }) {
  const [modalData, setModalData] = useState({ show: false, action: null });

  function openDeleteModal(game) {
    setModalData({
      show: true,
      message: `Are you sure you want to delete "${game.title}"?`,
      confirmText: "Delete",
      action: () => handleConfirmDelete(game.id), // Pass delete function
    });
  }

  async function handleConfirmDelete(id) {
    await onDelete(id); // Call delete function
    setModalData({ show: false }); // Close modal
  }

  return (
    <div className="table-container">
      {data.length > 0 ? (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.genre}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(item.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => openDeleteModal(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ConfirmationModal
            show={modalData.show}
            message={modalData.message}
            confirmText={modalData.confirmText}
            onConfirm={modalData.action}
            onClose={() => setModalData({ show: false })}
          />
        </>
      ) : (
        <p className="loading">Data loading...</p>
      )}
    </div>
  );
}

export default View;
