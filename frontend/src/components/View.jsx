import "./View.css";

function View({ data, onEdit, onDelete }) {
  return (
    <div className="table-container">
      {data.length > 0 ? (
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
                  <button className="edit-btn" onClick={() => onEdit(item.id)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="loading">Data loading...</p>
      )}
    </div>
  );
}

export default View;
