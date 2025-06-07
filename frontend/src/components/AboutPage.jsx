import "./AboutPage.css"; // adjust path as needed

export default function AboutPage() {
  return (
    <section className="aboutpage-container">
      <h1 className="aboutpage-title">Acerca de GameFinder</h1>
      <p className="aboutpage-description">
        GameFinder es una plataforma dedicada a facilitar la búsqueda y descubrimiento de videojuegos. Nuestra misión es conectar a los gamers con la información más precisa y actualizada sobre títulos de todas las plataformas.
      </p>
      <p className="aboutpage-mission">
        Creemos en la comunidad y en el poder de compartir experiencias, por eso ofrecemos funcionalidades para que los usuarios registrados puedan crear listas personalizadas y compartir sus juegos favoritos con otros jugadores.
      </p>
    </section>
  );
}
