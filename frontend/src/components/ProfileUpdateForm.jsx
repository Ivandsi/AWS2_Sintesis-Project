import React, { useState } from "react";

const updateUserProfile = async (userId, userData, profilePicture) => {
  const formData = new FormData();

  // Append the profile picture if provided
  if (profilePicture) {
    formData.append("profile_picture", profilePicture);
  }

  // Append other user data (username, email)
  formData.append("username", userData.username);
  formData.append("email", userData.email);

  // Serialize the profile data as JSON string and append it
  const profileData = {
    bio: userData.profile.bio,
    location: userData.profile.location,
    date_of_birth: userData.profile.date_of_birth, // Ensure this is in 'YYYY-MM-DD' format
  };

  formData.append("profile", JSON.stringify(profileData));

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/update`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update user profile");
    }

    const data = await response.json();
    console.log("User updated:", data);
    // Handle success, update UI, or notify user
  } catch (error) {
    console.error("Error updating user:", error);
    // Optionally handle the error and display a message to the user
  }
};

const ProfileUpdateForm = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    profile: {
      bio: "",
      location: "",
      date_of_birth: "",
    },
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setUserData({
      ...userData,
      profile: { ...userData.profile, [e.target.name]: e.target.value },
    });
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Set file in state
    setProfilePicture(file);

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result); // Set preview URL after file is read
    };

    if (file) {
      reader.readAsDataURL(file); // Read the file as Data URL (base64)
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(2, userData, profilePicture); // Send user ID, data, and file
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleInputChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="bio"
        placeholder="Bio"
        onChange={handleProfileChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        onChange={handleProfileChange}
      />
      <input type="date" name="date_of_birth" onChange={handleProfileChange} />
      <input type="file" name="profile_picture" onChange={handleFileChange} />
      {previewUrl && (
        <div>
          <h3>Image Preview:</h3>
          <img
            src={previewUrl}
            alt="Profile Preview"
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        </div>
      )}
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default ProfileUpdateForm;
