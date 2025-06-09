import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { AuthContext } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";
import { searchGames } from "../services/api";

const Header = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const userMenuRef = useRef();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/games?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/games");
    }
    setSearch("");
  };

  const searchTimeout = useRef();

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await searchGames(search.trim());
        setResults(data.results.slice(0, 8));
        setShowDropdown(true);
      } catch {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="header">
      <nav className="nav">
        <div className="log-container">
          <Link to="/" className="header-logo">
            <img src={logo} alt="GameVault Logo" className="header-logo-img" />
          </Link>
          <Link to="/" className="header-text">
            <h1 className="header-text-content">GameVault</h1>
          </Link>
        </div>
        <form className="header-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="header-search-input"
            placeholder="Buscar videojuegos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {showDropdown && isSearchFocused && results.length > 0 && (
            <ul className="header-search-results">
              {results.map((game) => (
                <li key={game.id}>
                  <Link
                    to={`/game/${game.id}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearch("");
                    }}
                  >
                    {game.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="header-search-btn">
            🔍
          </button>
        </form>
        <div className="nav-spacer" />
        <div className="nav-links">
          <Link to="/about" className="header-link">
            Acerca de
          </Link>
        </div>
        <div className="user-controls">
          {!user ? (
            <>
              <Link to="/login" className="header-btn header-btn-outline">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="header-btn header-btn-default">
                Registrarse
              </Link>
            </>
          ) : (
            <div className="user-dropdown-container" ref={userMenuRef}>
              <button
                className="user-dropdown-trigger"
                onClick={() => setUserMenuOpen((open) => !open)}
                type="button"
              >
                <span className="user-avatar">
                  <img
                    src={
                      user.profile.profile_picture ||
                      "/static/default-avatar.png"
                    }
                    alt="Foto de perfil"
                  />
                </span>
                <span className="user-name">
                  {user.username} <span style={{ fontSize: "1.1em" }}>▼</span>
                </span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="user-dropdown-item">
                    Perfil
                  </Link>
                  <button className="user-dropdown-item" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
