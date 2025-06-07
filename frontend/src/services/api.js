const API_ROOT_LOCAL = "http://localhost:8000/api/";
const API_ROOT_PRODUCTION = "https://gamevault.ieti.site/api/";
export const API_URL = API_ROOT_LOCAL;

const LOGIN_URL_LOCAL = "http://localhost:8000";
const LOGIN_URL_PRODUCTION = "https://gamevault.ieti.site/";

export const LOGIN_URL = API_ROOT_LOCAL;

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
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    throw err;
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

export async function searchItem(queryText, page = 1) {
  try {
    const response = await fetch(
      `${API_URL}catalegs/search?text=${encodeURIComponent(
        queryText
      )}&page=${page}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Error al buscar libros");
    }

    const data = await response.json();
    let modifiedData = data;
    if (data) {
      modifiedData = { ...data, searchText: queryText };
    }
    return modifiedData;
  } catch (err) {
    console.error("Error en la búsqueda de libros:", err.message);
    throw err;
  }
}

export async function getLoanHistory(userToken) {
  try {
    const response = await fetch(`${API_URL}prestecs/historial`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching loan history");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getLoanHistory:", error.message);
    throw error;
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

export async function insertLoan(userId, exemplarId) {
  try {
    const response = await fetch(`${API_URL}prestecs/${userId}/${exemplarId}`, {
      method: "POST",
    });

    if (!response.ok) {
      if (response.status === 500) {
        throw new Error("Server error: Unable to process the request");
      }
      throw new Error("Failed to insert loan");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error inserting loan:", err.message);
    throw err;
  }
}

export const generateBarcodePdf = async (codesArray) => {
  if (!Array.isArray(codesArray) || codesArray.length === 0) {
    // Es buena práctica validar la entrada incluso aquí
    throw new Error("Se requiere un array de códigos no vacío.");
  }

  const endpoint = `${API_URL}generate-exemplars-pdf/`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${tu_token_jwt}`
      },
      body: JSON.stringify({ exemplars: codesArray }), // Aquí cambias 'codes' por 'exemplars'
    });

    // Verifica si la respuesta HTTP fue exitosa (status 2xx)
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Si el cuerpo del error no es JSON válido, ignora y usa el mensaje HTTP
        console.warn("La respuesta de error del backend no era JSON:", e);
      }
    }

    // Si la respuesta es exitosa (2xx), el cuerpo debe ser el Blob del PDF
    const pdfBlob = await response.blob();

    // Verifica si el blob recibido es realmente un PDF (opcional pero recomendado)
    if (pdfBlob.type !== "application/pdf") {
      console.warn(`Se esperaba un PDF pero se recibió tipo: ${pdfBlob.type}`);
      // Puedes decidir lanzar un error aquí también si es crítico
      // throw new Error("La respuesta del servidor no fue un archivo PDF válido.");
    }

    // Crea una URL local para el Blob
    const fileURL = URL.createObjectURL(pdfBlob);

    return fileURL;
  } catch (error) {
    // Captura errores de red o los errores lanzados arriba
    console.error("Error en generateBarcodePdf API:", error);
    throw error;
  }
};

export async function searchExemplars(queryText, page = 1, userToken) {
  try {
    const response = await fetch(
      `${API_URL}exemplars/search?text=${encodeURIComponent(
        queryText
      )}&page=${page}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

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
