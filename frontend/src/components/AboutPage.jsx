import "./AboutPage.css";

export default function AboutPage() {
  return (
    <section className="aboutpage-container">
      <h1 className="aboutpage-title">Acerca de GameVault</h1>
      <p className="aboutpage-description">
        <b>GameVault</b> es tu espacio para descubrir, organizar y compartir tus videojuegos favoritos. Aquí puedes buscar información sobre miles de juegos, ver detalles, portadas y fechas de lanzamiento, y encontrar recomendaciones personalizadas.
      </p>
      <p className="aboutpage-detail">
        Los usuarios registrados pueden crear listas personalizadas (como "Jugando", "Terminado", "En espera" o "Wishlist"), añadir juegos a sus colecciones, escribir reseñas y compartir recomendaciones con la comunidad.
      </p>
      <p className="aboutpage-detail">
        Además, puedes buscar juegos por nombre, filtrar resultados, ver estadísticas de tu colección y acceder rápidamente a los títulos que más te interesan. GameVault también te permite descubrir tendencias, leer reseñas populares y mantenerte al día con las novedades del mundo gamer.
      </p>
      <p className="aboutpage-detail">
        GameVault está diseñado para que tanto jugadores casuales como entusiastas puedan gestionar fácilmente su biblioteca de videojuegos, encontrar inspiración para su próxima partida y conectar con otros fans de los videojuegos.
      </p>
    </section>
  );
}