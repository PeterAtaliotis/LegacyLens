import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Logo = () => {
  const [width, setWidth] = useState(0);
  const [showButton, setShowButton] = useState(false);

  // Update the size of the logo when the size of the screen changes
  const updateWidth = () => {
    const newWidth = window.innerWidth;
    setWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    // Call updateWidth immediately to set initial size
    updateWidth();
    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Change between the logo and the button when the user scrolls
  const changeNavButton = () => {
    if (window.scrollY >= 400 && window.innerWidth < 768) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeNavButton);
    // Clean up event listener on component unmount
    return () => window.removeEventListener("scroll", changeNavButton);
  }, []);

  return (
    <>
      <Link to="/" style={{ display: showButton ? "none" : "block" }}>
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{
            width: width < 1024 ? "60px" : "120px",
            height: width < 1024 ? "45px" : "90px",
          }}
          className="relative"
        />
      </Link>
      <div
        style={{
          display: showButton ? "block" : "none",
        }}
      >
        <Button />
      </div>
    </>
  );
};

export default Logo;
