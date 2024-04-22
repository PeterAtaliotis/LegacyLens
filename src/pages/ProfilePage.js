import React, { useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth0();
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!user || !user.sub) {
        setError('No user id found');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(user.sub)}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch user comments');
        }
        const comments = await response.json();
        setUserComments(comments);
      } catch (error) {
        console.error("Error fetching user comments:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserComments();
  }, [user]);

  if (!user) {
    return <div>Please log in to see this page.</div>;
  }

  return (
    <div className="p-5">
      <h1 id="page-title" className="text-3xl font-bold mb-4">Profile Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200 p-5 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <img src={user.picture} alt="Profile" className="rounded-full w-24 h-24 shadow-lg" />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Your Comments</h3>
        {loading && <p>Loading comments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && userComments.length > 0 ? (
          <ul>
            {userComments.map((comment) => (
              <li key={comment.comment_id} className="p-4 mb-4 border border-gray-300 rounded shadow-sm">
                <Link to={`/location/community/${comment.location_id}`} className="text-blue-500 hover:text-blue-700">
                  {comment.message_content}
                </Link>
                <p>Posted on: {new Date(comment.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments to display.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
