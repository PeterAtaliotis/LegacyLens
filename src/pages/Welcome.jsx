import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="hero min-h-screen bg-cover bg-center" style={{ backgroundImage: "url(/images/background2.jpg)" }}>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Our Website!</h1>
          <p className="py-6">
            Discover a new way of learning with our interactive courses.
            Join our community and start your journey today.
          </p>
          <div className="flex flex-col gap-4">
            <Link to="/explore">
              <button className="btn btn-primary">Explore Courses</button>
            </Link>
            <Link to="/signup">
              <button className="btn btn-secondary">Get Started</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
