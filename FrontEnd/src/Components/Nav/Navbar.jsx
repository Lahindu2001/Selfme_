import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav id="selfmeNavbarContainer">
      <h1 id="selfmeNavbarLogo">Selfme.lk</h1>
      <a href="/" id="selfmeNavHome">
        Home
      </a>
      <a href="#" id="selfmeNavProducts">
        Products
      </a>
      <a href="#" id="selfmeNavPackages">
        Packages
      </a>
      <a href="#" id="selfmeNavService">
        Service
      </a>
      <a href="#" id="selfmeNavAbout">
        About Us
      </a>
      <a href="#" id="selfmeNavContact">
        Contact
      </a>
      <a href="/logout" id="selfmeNavLogin">
        Logout
      </a>
    </nav>
  );
};

export default Navbar;