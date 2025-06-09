import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { fetchOptions, createGame } from "../services/api";
import { AuthContext } from "../contexts/AuthContext"; // Import AuthContext
import "./NewGameFormPage.css";

const NewGameFormPage = () => {
  const navigate = useNavigate();
  const { user, userToken } = useContext(AuthContext); // Access user and userToken from AuthContext
  const [loading, setLoading] = useState(true); // Local loading state
  const [formData, setFormData] = useState({
    title: "",
    releaseDate: "",
    developer: "",
    publisher: "",
    platforms: [],
    genres: [],
    tags: [],
    franchise: "",
    description: "",
    multiplayerSupport: false,
    coverImage: null,
    coverImagePreview: null,
  });
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    developers: [],
    publishers: [],
    platforms: [],
    genres: [],
    tags: [],
    franchises: [],
  });

  // Timeout to handle user loading failure
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) {
        setLoading(false); // Stop loading
      }
    }, 5000); // 5-second timeout

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, [user]);

  // Fetch options and set loading to false only after both user and options are loaded
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const fetchedOptions = await fetchOptions();
        setOptions(fetchedOptions);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user) {
      loadOptions().finally(() => setLoading(false));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        [name]: file,
        coverImagePreview: file ? URL.createObjectURL(file) : null,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setFormData({
      ...formData,
      [name]: selectedOptions.map((option) => option.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach((value) => formDataToSend.append(key, value));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await createGame(formDataToSend, userToken); // Pass userToken to createGame
      navigate("/games");
    } catch (err) {
      setError("Error al crear el videojuego. Por favor, inténtalo de nuevo.");
    }
  };

  if (loading) {
    return <div className="loading-message">Cargando...</div>;
  }

  if (!user || (!user.isSuperuser || !user.groups.includes("Administrador"))) {
    return (
      <div className="no-permission-message">
        <h2>Acceso denegado</h2>
        <p>No tienes permiso para acceder a esta página.</p>
        <button className="go-back-button" onClick={() => navigate("/")}>
          Volver a la página principal
        </button>
      </div>
    );
  }

  return (
    <div className="new-game-form-page">
      <h1>Añadir nuevo videojuego</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Título:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Fecha de lanzamiento:</label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Desarrollador:</label>
          <Select
            options={options.developers.map((developer) => ({
              value: developer.id,
              label: developer.name,
            }))}
            classNamePrefix="custom-select"
            onChange={(selectedOption) =>
              handleMultiSelectChange("developer", [selectedOption])
            }
          />
        </div>
        <div>
          <label>Editor:</label>
          <Select
            options={options.publishers.map((publisher) => ({
              value: publisher.id,
              label: publisher.name,
            }))}
            classNamePrefix="custom-select"
            onChange={(selectedOption) =>
              handleMultiSelectChange("publisher", [selectedOption])
            }
          />
        </div>
        <div>
          <label>Plataformas:</label>
          <Select
            options={options.platforms.map((platform) => ({
              value: platform.id,
              label: platform.name,
            }))}
            isMulti
            classNamePrefix="custom-select"
            onChange={(selectedOptions) =>
              handleMultiSelectChange("platforms", selectedOptions)
            }
          />
        </div>
        <div>
          <label>Géneros:</label>
          <Select
            options={options.genres.map((genre) => ({
              value: genre.id,
              label: genre.name,
            }))}
            isMulti
            classNamePrefix="custom-select"
            onChange={(selectedOptions) =>
              handleMultiSelectChange("genres", selectedOptions)
            }
          />
        </div>
        <div>
          <label>Etiquetas:</label>
          <Select
            options={options.tags.map((tag) => ({
              value: tag.id,
              label: tag.name,
            }))}
            isMulti
            classNamePrefix="custom-select"
            onChange={(selectedOptions) =>
              handleMultiSelectChange("tags", selectedOptions)
            }
          />
        </div>
        <div>
          <label>Franquicia:</label>
          <Select
            options={[
              { value: "", label: "Ninguna" },
              ...options.franchises.map((franchise) => ({
                value: franchise.id,
                label: franchise.name,
              })),
            ]}
            classNamePrefix="custom-select"
            onChange={(selectedOption) =>
              handleMultiSelectChange("franchise", [selectedOption])
            }
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="checkbox-container">
          <label>Soporte multijugador:</label>
          <input
            type="checkbox"
            name="multiplayerSupport"
            checked={formData.multiplayerSupport}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Imagen de portada:</label>
          <div
            className="cover-image-preview"
            onClick={() =>
              document.querySelector('input[name="coverImage"]').click()
            }
          >
            {formData.coverImagePreview ? (
              <img src={formData.coverImagePreview} alt="Preview" />
            ) : (
              <span>Clic para añadir imagen</span>
            )}
          </div>
          <input
            type="file"
            name="coverImage"
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Añadir</button>
      </form>
    </div>
  );
};

export default NewGameFormPage;
