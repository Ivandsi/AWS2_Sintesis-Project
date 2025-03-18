import { useState } from "react";
import "./Edit.css";

function Add({ onSave, onCancel }) {
  const [newItem, setNewItem] = useState([]);

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  return (
    <div className="edit-container">
      <h2>Edit Game</h2>
      <label>Title:</label>
      <input
        type="text"
        name="title"
        value={""}
        onChange={handleChange}
      />

      <label>Genre:</label>
      <input
        type="text"
        name="genre"
        value={""}
        onChange={handleChange}
      />

      <button className="newCancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button className="add-btn" onClick={() => onSave(newItem)}>
        Save
      </button>
    </div>
  );
}

export default Add;
