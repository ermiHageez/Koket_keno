import React from "react";
import { useNavigate } from "react-router-dom";
import "./componentsCSS/Header.css"; 

const Footer = () => {
 const navigate = useNavigate();
  return (
    <div className="Footer">
        <p>© 2024 Keno Game. All rights reserved.</p>
    </div>
  );
};

export default Footer;
