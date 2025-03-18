import { useState } from "react";
import "./Edit.css";

function Edit({ item, onSave, onCancel }) {
  const [editedItem, setEditedItem] = useState(item);

  const handleChange = (e) => {
    setEditedItem({ ...editedItem, [e.target.name]: e.target.value });
  };

  return (
    <div className="edit-container">
      <h2>Edit Game</h2>
      <label>Title:</label>
      <input
        type="text"
        name="title"
        value={editedItem.title}
        onChange={handleChange}
      />

      <label>Genre:</label>
      <input
        type="text"
        name="genre"
        value={editedItem.genre}
        onChange={handleChange}
      />

      <button className="editCancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button className="save-btn" onClick={() => onSave(editedItem)}>
        Save
      </button>
    </div>
  );
}

export default Edit;
