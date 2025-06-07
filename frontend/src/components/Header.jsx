import { useContext } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
// import DarkModeSwitch from "./ui/DarkModeSwitch"; // still commented out
import "./Header.css"; // import the CSS file
import { AuthContext } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          GameVault
        </Link>
        <div className="user-controls">
          {/* <DarkModeSwitch /> */}

          {!user ? (
            <>
              <Link to="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button variant="default">Registrarse</Button>
              </Link>
            </>
          ) : (
            <>
              <span className="greeting">
                Hola, {user.username}{" "}
                <span role="img" aria-label="saludo">
                  👋
                </span>
              </span>
              <Button variant="outline" onClick={logout}>
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
