import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import GameDetailPage from "./components/GameDetailPage";
import GameSearchPage from "./components/GameSearchPage";
import NewGameFormPage from "./components/NewGameFormPage";
import UserListPage from "./components/UserListPage";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Router>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Ruta para la página de detalles del juego.
                :gameId es un parámetro dinámico que capturará el ID del juego. */}
          <Route path="/game/:gameId" element={<GameDetailPage />} />
          <Route path="/games" element={<GameSearchPage />} />
          <Route path="/games/new" element={<NewGameFormPage />} />
          <Route path="/list/:listType" element={<UserListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* add more routes as needed */}
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
