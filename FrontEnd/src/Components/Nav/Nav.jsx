import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';

function Nav() {
  return (
    <div>
      <ul className="home-ul">
        <li className="home-li">
          <NavLink
            to="/mainAdminhome"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Admin Home</h1>
          </NavLink>
        </li>

        <li className="home-li">
          <NavLink
            to="/SupplyRequest"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            
            <h1>Supply Request Management</h1>
          </NavLink>
        </li>

        <li className="home-li">
          <NavLink
            to="#"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            
            <h1>Supply Product Management</h1>
          </NavLink>
        </li>

      </ul>
    </div>
  );
}

export default Nav;