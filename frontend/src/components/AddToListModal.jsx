import React from "react";

export default function AddToListModal({
  show,
  listNames,
  selectedList,
  setSelectedList,
  onAdd,
  onClose,
  currentListName,
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Selecciona una lista</h3>
        <select
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <option value="null">Ninguna</option>
          {listNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div style={{ marginTop: "1em" }}>
          <button
            onClick={onAdd}
            disabled={!selectedList || selectedList === currentListName}
          >
            Añadir
          </button>
          <button style={{ marginLeft: "1em" }} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
