import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const getDropdownItemClass = (path) =>
    location.pathname === path
      ? 'dropdown-item active text-warning fw-semibold'
      : 'dropdown-item';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
      <div className="container-fluid px-4">

        {/* Left: Brand */}
        <Link className="navbar-brand fw-bold text-warning" to="/">Strumurai</Link>

        {/* Toggle for mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav items */}
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav mx-auto">

            <li className="nav-item">
              <Link className={location.pathname === '/' ? 'nav-link active text-warning fw-semibold' : 'nav-link'} to="/">Home</Link>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="modesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Modes
              </a>
              <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="modesDropdown">
                <li>
                  <Link className={getDropdownItemClass('/beginner')} to="/beginner">Beginner Mode</Link>
                </li>
                <li>
                  <Link className={getDropdownItemClass('/intermediate')} to="/intermediate">Intermediate Mode</Link>
                </li>
                <li>
                  <Link className={getDropdownItemClass('/advanced')} to="/advanced">Advanced Mode</Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* Right: Login/Logout */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link btn btn-outline-light btn-sm me-2" to="/login">Log in</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
