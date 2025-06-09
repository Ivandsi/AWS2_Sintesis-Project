import React from "react";
import "./Toast.css"; // Import the CSS file

const CustomToast = ({ type, children }) => {
  return (
    <div className={`toast ${type}`}>
      {children}
    </div>
  );
};

export default CustomToast;