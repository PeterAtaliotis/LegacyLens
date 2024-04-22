import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="hero min-h-screen bg-cover bg-center" style={{ backgroundImage: "url(/images/background2.jpg)" }}>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to LegacyLens</h1>
          <p className="py-6">
            Discover the history around you
          </p>
          <div className="flex flex-col gap-4">
            <Link to="/map">
              <button className="btn btn-default">Disover History With Maps</button>
            </Link>
            <Link to="/test">
              <button className="btn btn-accent">Discover History Around You With AR</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
