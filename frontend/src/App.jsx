import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import View from "./components/View";
import Edit from "./components/Edit";
import ProfileUpdateForm from "./components/ProfileUpdateForm";

function App() {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchData() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/games`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleEdit(id) {
    console.log("Editing gameID " + id);
    const item = data.find((d) => d.id === id);
    console.log(item);
    setEditingItem(item);
  }

  function handleEditCancel() {
    setEditingItem(null);
  }

  async function handleEditSave(editItem) {
    console.log(JSON.stringify(editItem));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/games/${editItem.id}/edit`, // Removed trailing slash
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editItem),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update the game");
      }

      const result = await response.json();
      console.log("Updated:", result);

      setData((prevData) =>
        prevData.map((d) => (d.id === editItem.id ? result : d))
      );
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/games/${id}/delete`, // Ensure this URL is correct
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Read response as plain text
        let errorMessage = "Failed to delete the game";

        try {
          const errorData = JSON.parse(errorText); // Try parsing JSON
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          console.error("Error parsing response:", e);
        }

        throw new Error(errorMessage);
      }

      console.log(`Deleted game with id: ${id}`);

      setData((prevData) => prevData.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }

  async function handleAddGame(newGame) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/games/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newGame), // Send the new game data
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add the game");
      }

      const result = await response.json();
      console.log("Added game:", result);

      // Add the new game to the state
      setData((prevData) => [...prevData, result]);
    } catch (error) {
      console.error("Error adding game:", error);
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <ProfileUpdateForm />
      {editingItem ? (
        <Edit
          item={editingItem}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      ) : (
        <View data={data} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </>
  );
}

export default App;
