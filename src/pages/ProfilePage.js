import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

const ProfilePage = () => {
  const { user } = useAuth0();

  if (!user) {
    return null;
  }

  return (
      <div className="p-5">
        <h1 id="page-title" className="text-3xl font-bold mb-4">
          Profile Page
        </h1>
        <div className="mb-4">
          <p id="page-description" className="mb-2">
            <span>
              You can use the <strong>ID Token</strong> to get the profile
              information of an authenticated user.
            </span>
          </p>
          <p>
            <strong>Only authenticated users can access this page.</strong>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200 p-5 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <img
              src={user.picture}
              alt="Profile"
              className="rounded-full w-24 h-24 shadow-lg"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <span className="text-gray-600">{user.email}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
              title="Decoded ID Token"
              code={JSON.stringify(user, null, 2)}
              // Assuming CodeSnippet is also styled with Tailwind CSS
          </div>
        </div>
        <div className="mt-4 md:mt-0 py-8">
        <button
            onClick={() => window.history.back()}
            className="btn btn-info"
          >
            Go Back
          </button>
        </div>

      </div>
  );
};

export default ProfilePage;

