import React, { useState, useEffect } from 'react';

const MessageBoard = ({ locationId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // Add states for like and dislike if necessary

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
    if (!newComment.trim()) {
      alert("Please write something in your comment before posting.");
      return;
    }
  
    // Example user data, replace with actual data from user context or authentication
    const commentData = {
      user_id: "123456789", // This should come from the logged-in user context
      username: "UserExample", // Same as above, user's actual username
      dislikes: 0,
      likes: 0,
      message_content: newComment,
    };
  
    try {
      const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
  
      const newCommentData = await response.json();
  
      // Optionally, you can fetch all comments again to refresh the list
      // but here we'll just add the new comment to the local state
      setComments(prevComments => [...prevComments, newCommentData.comment]);
      setNewComment(''); // Clear the textarea after posting
    } catch (error) {
      console.error("Error posting new comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };
  

  // Implement like, dislike, edit, and delete functions following similar patterns

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
      <div>
        {comments.map(comment => (
          <div key={comment._id} className="p-4 mb-2 bg-base-100 rounded-box">
            <p>{comment.message_content}</p>
            {/* Implement like, dislike buttons, and edit, delete if the user owns the comment */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageBoard;
