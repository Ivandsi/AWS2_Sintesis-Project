import { LIST_TYPE_NAMES } from "./constants";

const API_ROOT_LOCAL = "http://localhost:8000/api/";
const API_ROOT_PRODUCTION = "https://gamevault.ieti.site/api/";
export const API_URL = API_ROOT_PRODUCTION;

const LOGIN_URL_LOCAL = "http://localhost:8000";
const LOGIN_URL_PRODUCTION = "https://gamevault.ieti.site/";

export const LOGIN_URL = LOGIN_URL_PRODUCTION;

export const getBooks = () => {
  return fetch(API_URL + "llibres")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener los libros");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error en la API:", error);
      return [];
    });
};

/* Obtenemos el archivo CSV para ser exportado en la base de datos*/
export const importCsv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(API_URL + "importUsersFromCsv/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al importar el CSV");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en la API:", error);
    throw error;
  }
};

export const getItemById = async (id, itemType) => {
  try {
    const response = await fetch(`${API_URL}catalegs/${itemType}/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener la información del Item");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error en la API:", error);
    return null;
  }
};

export async function register(formData) {
  try {
    const response = await fetch(API_URL + "register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Registration failed:", errorData);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Error al registrar:", error);
    return { success: false };
  }
}

export async function logIn(mail, password) {
  try {
    // Codificar las credenciales en Base64
    const credentials = btoa(`${mail}:${password}`);

    // Realizar la solicitud al endpoint de autenticación
    const response = await fetch(API_URL + "token", {
      method: "GET", // El endpoint usa GET
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    // Guardar el token en localStorage
    localStorage.setItem("token", data.token);

    return data.token;
  } catch (err) {
    console.error("Error during login:", err.message);
    throw err;
  }
}

export async function getUserInfo(token) {
  try {
    const response = await fetch(API_URL + "users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("token"); // Remove the old token
        throw new Error(
          "Token has expired or is invalid. Please log in again."
        );
      }
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    return null; // Return null if there's an error
  }
}

export async function updateProfile(data, token) {
  try {
    const formData = new FormData();
    // Append all fields from the data object
    if (data.username) formData.append("username", data.username);
    if (data.email) formData.append("email", data.email);
    if (data.bio) formData.append("bio", data.bio);
    if (data.location) formData.append("location", data.location);
    if (data.date_of_birth)
      formData.append("date_of_birth", data.date_of_birth);
    if (data.profile_picture)
      formData.append("profile_picture", data.profile_picture);

    const response = await fetch(`${API_URL}users/me/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type, browser will set it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData); // Log the error response
      throw new Error(errorData.formErrors || "Error al actualizar el perfil");
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error al actualizar el perfil:", err.message);
    throw err; // Rethrow the error for further handling
  }
}

export async function updateUserProfile(token, email, telefon, avatar = null) {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("telefon", telefon);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    const response = await fetch(API_URL + "update-profile/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.formErrors || "Error al actualizar el perfil");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error al actualizar el perfil:", err.message);
    throw err;
  }
}

export async function searchUsers(textQuery, userToken) {
  try {
    const response = await fetch(`${API_URL}usuaris/${textQuery}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error("Server error: Unable to process the request");
      }
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    throw err;
  }
}

export async function googleLogin(id_token) {
  const response = await fetch(API_URL + "google-login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
  });
  if (!response.ok) {
    throw new Error("Google login failed");
  }
  const data = await response.json();
  return data.token;
}

export async function microsoftLoginFromMsalResponse(msalResponse) {
  // Extrae el idToken del objeto de respuesta de MSAL
  const id_token = msalResponse.idToken;
  if (!id_token) throw new Error("No se ha recibido id_token de Microsoft");

  const response = await fetch(API_URL + "microsoft-login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token }),
  });
  if (!response.ok) {
    throw new Error("Microsoft login failed");
  }
  const data = await response.json();
  return data.token;
}

// --- Nuevas funciones para el panel de usuario ---

/**
 * Obtiene las estadísticas de juegos del usuario actual.
 * @param {string} token - Token de autenticación del usuario.
 * @returns {Promise<object>} Las estadísticas del usuario (played, playing, reviews, etc.).
 */
export async function getUserDashboardStats(token) {
  try {
    const response = await fetch(`${API_URL}user/profile/stats`, {
      headers: {
        Authorization: `Bearer ${token}`, // Usar Bearer token
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Error al obtener las estadísticas del usuario"
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getUserDashboardStats:", error);
    throw error;
  }
}

/**
 * Obtiene una lista de juegos en tendencia.
 * @param {string} token - Token de autenticación del usuario (opcional si el endpoint es público).
 * @returns {Promise<Array<object>>} Una lista de objetos de juego.
 */
export async function getTrendingGames(token) {
  try {
    const response = await fetch(`${API_URL}games/trending-games`, {
      headers: {
        Authorization: `Bearer ${token}`, // Usar Bearer token
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Error al obtener los juegos en tendencia"
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getTrendingGames:", error);
    throw error;
  }
}

/**
 * Obtiene una lista de reseñas populares.
 * @param {string} token - Token de autenticación del usuario (opcional si el endpoint es público).
 * @returns {Promise<Array<object>>} Una lista de objetos de reseña.
 */
export async function getPopularReviews(token) {
  try {
    const response = await fetch(`${API_URL}reviews/popular-reviews`, {
      headers: {
        Authorization: `Bearer ${token}`, // Usar Bearer token
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Error al obtener las reseñas populares"
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getPopularReviews:", error);
    throw error;
  }
}

/** * Busca juegos por un término de búsqueda.
 * @param {string} query - El término de búsqueda.
 * @param {number} page - Número de página para la paginación (opcional, por defecto 1).
 * @param {number} per_page - Número de resultados por página (opcional, por defecto 10).
 * @returns {Promise<object>} Un objeto con los resultados de la búsqueda y metadatos de paginación.
 */
export async function searchGames(query, page = 1, per_page = 10) {
  try {
    const params = new URLSearchParams({
      q: query,
      page,
      per_page,
    });
    const res = await fetch(`${API_URL}games/search?${params.toString()}`);
    if (!res.ok) throw new Error("Error fetching games");
    return await res.json();
  } catch (error) {
    console.error("Error in searchGames:", error);
    return { results: [], total_pages: 1, total_games: 0 };
  }
}

/**
 * Obtiene los detalles completos de un juego por su ID.
 * @param {number} gameId - El ID del juego.
 * @returns {Promise<object>} Los detalles completos del juego.
 */
export async function getGameDetails(gameId, token = null) {
  // Añadimos token como opcional
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}games/${gameId}`, {
      // URL corregida
      headers: headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "No se pudieron cargar los detalles del juego"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getGameDetails para ID ${gameId}:`, error);
    throw error;
  }
}

/**
 /**
 * Crea un nuevo videojuego.
 * @param {object} data - Los datos del formulario para crear el videojuego.
 * @param {string} token - El token de autenticación del usuario.
 * @returns {Promise<object>} Los detalles del videojuego creado.
 */
export async function createGame(data, token) {
  try {
    const formData = new FormData();

    // Append all fields from the FormData object
    if (data.get("title")) formData.append("title", data.get("title"));
    if (data.get("releaseDate"))
      formData.append("release_date", data.get("releaseDate"));
    if (data.get("developer"))
      formData.append("developer", data.get("developer"));
    if (data.get("publisher"))
      formData.append("publisher", data.get("publisher"));

    // Append platforms, genres, and tags as individual fields
    const platforms = data.getAll("platforms");
    if (platforms.length > 0) {
      platforms.forEach((platform) => formData.append("platforms", platform)); // Append each value
    }

    const genres = data.getAll("genres");
    if (genres.length > 0) {
      genres.forEach((genre) => formData.append("genres", genre)); // Append each value
    }

    const tags = data.getAll("tags");
    if (tags.length > 0) {
      tags.forEach((tag) => formData.append("tags", tag)); // Append each value
    }

    if (data.get("franchise"))
      formData.append("franchise", data.get("franchise"));
    if (data.get("description"))
      formData.append("description", data.get("description"));
    if (data.get("multiplayerSupport") !== undefined) {
      formData.append("multiplayer_support", data.get("multiplayerSupport"));
    }
    if (data.get("coverImage"))
      formData.append("cover_image", data.get("coverImage"));

    const headers = {
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    };

    console.log("FormData entries:", [...formData.entries()]); // Log the FormData for debugging

    const response = await fetch(`${API_URL}games/add`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData); // Log the full error response
      throw new Error(
        errorData.detail ||
          JSON.stringify(errorData) ||
          "Error al crear el videojuego."
      );
    }

    const result = await response.json();
    return result; // Return the created game data
  } catch (err) {
    console.error("Error al crear el videojuego:", err.message);
    throw err; // Rethrow the error for further handling
  }
}

/**
 * Obtiene las reseñas de un juego por su ID.
 * @param {number} gameId - El ID del juego.
 * @returns {Promise<Array<object>>} Una lista de reseñas del juego.
 */
export async function getGameReviews(gameId, page = 1, perPage = 4) {
  try {
    const response = await fetch(
      `${API_URL}games/${gameId}/reviews?page=${page}&per_page=${perPage}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "No se pudieron cargar las reseñas del juego"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en getGameReviews para ID ${gameId}:`, error);
    throw error;
  }
}

export async function getGameUserReview(gameId, token) {
  try {
    const response = await fetch(`${API_URL}games/${gameId}/user-review`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "No se pudo obtener la reseña del usuario"
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en getGameUserReview para ID ${gameId}:`, error);
    throw error;
  }
}

export async function createReview(gameId, reviewData, token) {
  const response = await fetch(`${API_URL}games/${gameId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "No se pudo crear la reseña");
  }
  return await response.json();
}

export async function updateReview(gameId, reviewData, token) {
  const response = await fetch(`${API_URL}games/${gameId}/reviews`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "No se pudo actualizar la reseña");
  }
  return await response.json();
}

export async function addGameToList(listName, gameId, token) {
  const response = await fetch(
    `${API_URL}user/my-lists/${encodeURIComponent(listName)}/add/${gameId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || "No se pudo añadir el juego a la lista"
    );
  }

  return await response.json();
}

export async function getUserLists(token) {
  const response = await fetch(`${API_URL}user/my-lists`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("No se pudieron obtener las listas");
  return await response.json();
}

export async function getUserList(token, listType) {
  const res = await fetch(`${API_URL}user/my-lists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo obtener la lista");
  const lists = await res.json();
  const list = lists.find((list) => list.name === LIST_TYPE_NAMES[listType]);
  return list;
}

export async function removeGameFromList(token, listId, gameId) {
  const res = await fetch(
    `${API_URL}user/my-lists/${listId}/remove/${gameId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("No se pudo eliminar el juego");
}

export const fetchOptions = async () => {
  try {
    const response = await Promise.all([
      fetch(`${API_URL}developers`),
      fetch(`${API_URL}publishers`),
      fetch(`${API_URL}platforms`),
      fetch(`${API_URL}genres`),
      fetch(`${API_URL}tags`),
      fetch(`${API_URL}franchises`),
    ]);
    const [developers, publishers, platforms, genres, tags, franchises] =
      await Promise.all(response.map((res) => res.json()));
    return {
      developers,
      publishers,
      platforms,
      genres,
      tags,
      franchises,
    };
  } catch (err) {
    throw new Error(
      "Error al cargar las opciones. Por favor, inténtalo de nuevo."
    );
  }
};
