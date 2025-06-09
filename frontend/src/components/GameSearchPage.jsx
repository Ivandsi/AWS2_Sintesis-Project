import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { searchGames } from "../services/api";
import "./GameSearchPage.css";
import Paginator from "./ui/Paginator";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PER_PAGE = 10;

const GameSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery().get("q") || "";
  const page = parseInt(useQuery().get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(1);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    setLoading(true);
    searchGames(query, page, PER_PAGE)
      .then((data) => {
        setGames(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalGames(data.total_games || 0);
      })
      .finally(() => setLoading(false));
  }, [query, page, location.key]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    let url = `/games`;
    if (query && query.trim()) {
      url += `?q=${encodeURIComponent(query)}`;
    }
    if (newPage > 1) {
      if (query && query.trim()) {
        url += `&page=${newPage}`;
      } else {
        url = `/games?page=${newPage}`;
      }
    }
    navigate(url);
  };

  return (
    <main className="game-search-page">
      <h2 className="game-search-title">
        {query && query.trim() && (
          <>
            <span className="game-search-count">{totalGames}</span> resultados
            para <span className="game-search-query">{query}</span>
          </>
        )}{" "}
        {!query && (
          <>
            <span className="game-search-count">{totalGames}</span> resultados
            en total
          </>
        )}
        {query && query.trim() && " "}
      </h2>
      {loading && <p>Buscando juegos...</p>}
      {!loading && games.length === 0 && <p>No se encontraron juegos.</p>}
      <ul className="game-search-list">
        {games.map((game) => (
          <li className="game-search-item" key={game.id}>
            <Link className="game-search-link" to={`/game/${game.id}`}>
              <img
                className="game-search-cover"
                src={game.cover_url || "/static/placeholder.png"}
                alt={game.title}
                loading="lazy"
              />
              <div className="game-search-info">
                <span className="game-search-name">{game.title}</span>
                {game.release_year && (
                  <span className="game-search-year">{game.release_year}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {/* Modern paginator */}
      {totalPages > 1 && (
        <Paginator
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          maxVisible={10} // or any number you want
        />
      )}
    </main>
  );
};

export default GameSearchPage;
