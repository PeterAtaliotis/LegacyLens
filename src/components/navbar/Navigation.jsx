import React, { useState } from 'react';
import Navbar from './navbartop'; // Make sure the path matches where your Navbar component is located
import Sidebar from './sidebar'; // Make sure the path matches where your Sidebar component is located

const Navigation = () => {
  // State to manage whether the Sidebar is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the Sidebar open/closed state
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Navbar toggle={toggle} />
      {/* <Sidebar isOpen={isOpen} toggle={toggle} /> */}
    </>
  );
};

export default Navigation;
