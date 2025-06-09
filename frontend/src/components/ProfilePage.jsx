import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext"; // Import useToast
import { updateProfile } from "../services/api";
import "./ProfilePage.css";


// You can import your custom Input component if you want to use it for all fields
// import Input from "./Input";

export default function ProfilePage() {
  const { user, userToken } = useContext(AuthContext);
  const { addToast } = useToast(); // Use the ToastContext
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    date_of_birth: "",
    profile_picture: null,
  });
  const [preview, setPreview] = useState("/static/default-avatar.png");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        date_of_birth: user.profile?.date_of_birth || "",
        profile_picture: null,
      });
      setPreview(
        user.profile?.profile_picture
          ? user.profile.profile_picture
          : "/static/default-avatar.png"
      );
    }
  }, [user]);

  if (!user) {
    return (
      <section className="profilepage-container">
        <h2>Cargando perfil...</h2>
      </section>
    );
  }

  if (!userToken) {
    navigate("/");
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    setEditing(false);
    setForm({
      username: user.username,
      email: user.email,
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      date_of_birth: user.profile?.date_of_birth || "",
      profile_picture: null,
    });
    setPreview(
      user.profile?.profile_picture
        ? user.profile.profile_picture
        : "/static/default-avatar.png"
    );
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profile_picture: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(
        {
          username: form.username,
          email: form.email,
          bio: form.bio,
          location: form.location,
          date_of_birth: form.date_of_birth,
          profile_picture: form.profile_picture,
        },
        userToken
      );
      setEditing(false);
      addToast("success", "Perfil actualizado correctamente."); // Success toast
      window.location.reload();
    } catch (err) {
      addToast("error", "No se pudieron guardar los cambios."); // Error toast
    }
  };

  return (
    <section className="profilepage-container">
      <h1 className="profilepage-title">Mi Perfil</h1>
      <div className="profilepage-info">
        <div style={{ position: "relative" }}>
          <img
            className="profilepage-avatar"
            src={preview || "/static/default-avatar.png"}
            alt="Foto de perfil"
            style={editing ? { cursor: "pointer", borderColor: "#00bcd4" } : {}}
            onClick={
              editing
                ? () => document.getElementById("profile-picture-input").click()
                : undefined
            }
            title={editing ? "Haz clic para cambiar la foto" : ""}
          />
          {editing && (
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-[#3c3c3c] dark:border-[#3c3c3c] dark:text-white"
              style={{ display: "none" }}
            />
          )}
        </div>
        <div className="profilepage-details">
          {!editing ? (
            <div className="profilepage-details-content">
              <p>
                <b>Usuario:</b> {user.username}
              </p>
              <p>
                <b>Email:</b> {user.email}
              </p>
              {user.profile?.bio && (
                <p>
                  <b>Bio:</b> {user.profile.bio}
                </p>
              )}
              {user.profile?.location && (
                <p>
                  <b>Ubicación:</b> {user.profile.location}
                </p>
              )}
              {user.profile?.date_of_birth && (
                <p>
                  <b>Fecha de nacimiento:</b> {user.profile.date_of_birth}
                </p>
              )}
              <button className="profilepage-edit-btn" onClick={handleEdit}>
                Editar perfil
              </button>
            </div>
          ) : (
            <form className="profilepage-edit-form" onSubmit={handleSave}>
              <label>
                Usuario:
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Bio:
                <input
                  type="text"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                />
              </label>
              <label>
                Ubicación:
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </label>
              <label>
                Fecha de nacimiento:
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth || ""}
                  onChange={handleChange}
                />
              </label>
              <div className="profilepage-edit-actions">
                <button type="submit" className="profilepage-save-btn">
                  Guardar
                </button>
                <button
                  type="button"
                  className="profilepage-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
