import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const MessageBoard = ({ locationId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Fetch comments for the location
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [locationId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !isAuthenticated) {
      alert("Please write something in your comment before posting or make sure you're logged in.");
      return;
    }

    // Use user's information from Auth0
    const commentData = {
      user_id: user.sub, // Use Auth0's user ID
      username: user.name || user.nickname || "Anonymous", // Use Auth0's username or nickname
      dislikes: 0,
      likes: 0,
      message_content: newComment,
    };

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newCommentData = await response.json();
      setComments(prevComments => [...prevComments, newCommentData.comment]);
      setNewComment(''); // Clear the textarea after posting
    } catch (error) {
      console.error("Error posting new comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Write your comment here..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handlePostComment}>Post Comment</button>
      </div>
      {comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <div key={comment._id} className="p-4 mb-2 bg-base-100 rounded-box">
              <p>{comment.message_content}</p>
              <p>Posted by: {comment.username}</p>
              {/* Implement like, dislike buttons, and edit, delete if the user owns the comment */}
            </div>
          ))}
        </div>
      ) : (
        <p>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default MessageBoard;


 // Implement like, dislike, edit, and delete functions following similar patterns

 // Implement like, dislike buttons, and edit, delete if the user owns the comment 

       // Optionally, you can fetch all comments again to refresh the list
      // but here we'll just add the new comment to the local state