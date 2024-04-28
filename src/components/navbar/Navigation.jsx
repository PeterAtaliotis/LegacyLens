import React, { useState } from 'react';
import Navbar from './navbartop';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Navbar toggle={toggle} />
    </>
  );
};

export default Navigation;
