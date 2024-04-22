import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';
import LoginButton from "../authComponents/login";
import LogoutButton from "../authComponents/logout";
import Profile from "../authComponents/profile";



const Navbar = ({ toggle }) => {

  const navigate = useNavigate();

  const goToProfile = () => {
    navigate('/profile'); // Assuming your profile page's route is '/profile'
  };
  
  const { isAuthenticated } = useAuth0();
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <button tabIndex={0} className="btn btn-ghost lg:hidden" onClick={toggle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          {/* Adjusted Dropdown menu with React Router's Link */}
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link to="/test">AR</Link></li>
            <li><a><Link to="/map">Map</Link></a></li>
            <li><a><Link to="/profile">Profile</Link></a></li>
            </ul>
        </div>
        <Logo />
        <a className="btn btn-ghost text-xl"><Link to ="/">LegacyLens</Link></a>
      </div>
      <div className="navbar-center hidden lg:flex">
      <ul className="menu menu-horizontal px-1">
      <li><Link to ="/test">AR</Link></li>
      <li><Link to ="/map">Map</Link></li>
      <li><Link to ="/profile">Profile</Link></li>
    </ul>
      </div>
      <div className="navbar-end">
        {!isAuthenticated && (
          <>
            <LoginButton/>
          </>
        )}
        {isAuthenticated && (
          <>
            <LogoutButton/>
          </>
        )}
      </div>  
      <div className="avatar px-8" onClick={goToProfile}> 
        <div className="w-16 rounded">
          <Profile></Profile>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
