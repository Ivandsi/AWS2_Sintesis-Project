import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { getUserList, removeGameFromList } from "../services/api";
import { LIST_TYPE_NAMES } from "../services/constants";
import "./UserListPage.css";

export default function UserListPage() {
  const { listType } = useParams();
  const { userToken } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [listId, setListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userToken) {
      navigate("/login");
    }
    setLoading(true);
    getUserList(userToken, listType)
      .then((list) => {
        setGames(list?.games ?? []);
        setListId(list?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [userToken, listType]);

  const handleRemove = async (gameId) => {
    if (!listId) return;
    await removeGameFromList(userToken, listId, gameId);
    const updated = games.filter((g) => g.id !== gameId);
    setGames(updated);
    if (updated.length === 0) {
      navigate("/dashboard"); // Go back if list is empty
    }
  };

  const handleGoToDetail = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  if (loading) return <div className="user-list-loading">Cargando...</div>;
  if (!games.length)
    return <div className="user-list-empty">Esta lista está vacía.</div>;

  return (
    <section className="user-list-section">
      <h2>Lista: {LIST_TYPE_NAMES[listType] || listType}</h2>
      <ul className="user-list-ul">
        {games.map((game) => (
          <li
            key={game.id}
            onClick={() => handleGoToDetail(game.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="user-list-info">
              {game.cover_image_url ? (
                <img
                  src={game.cover_image_url}
                  alt={game.title}
                  className="user-list-cover"
                />
              ) : (
                <div className="user-list-cover user-list-no-cover">
                  Sin Portada
                </div>
              )}
              <span className="user-list-title">{game.title}</span>
            </div>
            <button
              className="user-list-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(game.id);
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
