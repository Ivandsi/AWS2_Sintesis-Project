import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import View from "./components/View";

function App() {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchData() {
    console.log(import.meta.env.VITE_API_URL);
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

  function handleEdit(id) {
    console.log("Editing gameID " + id);
    const item = data.find((d) => d.id === id);
    setEditingItem(item);
  }

  async function handleSave(editItem) {
    console.log(import.meta.env.VITE_API_URL);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/games/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the game");
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

  function handleDelete(id) {
    console.log("Deleting gameID " + id);
  }

  useEffect(() => {
    fetchData();
  }, []);

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
      <View data={data} onEdit={handleEdit} onDelete={handleDelete} />
    </>
  );
}

export default App;
