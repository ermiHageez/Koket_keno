import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./componentsCSS/Header.css";
import { UserContext } from "../context/UserContext";

const Header = () => {
  // ✅ use useContext() to access context values
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="Header">
      <h3>🎯 Welcome to Keno Game</h3>
      <p>{user ? `@${user.username}` : "Guest"}</p>
    </div>
  );
};

export default Header;
