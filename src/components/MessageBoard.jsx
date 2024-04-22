import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import LocationInfo from '../components/LocationInfo';
import { useNavigate } from 'react-router-dom';


const MessageBoard = ({ locationId }) => {
  const [locationDetails, setLocationDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);  // To track the currently editing comment
  const [editContent, setEditContent] = useState("");  // State to hold the editable content
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();  // Instantiate navigate function

  // Function to handle navigation to the location details page
  const goToLocationDetails = () => {
    navigate(`/location/${locationId}`);
  };


  const handleDeleteComment = async (commentId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
        body: JSON.stringify({
          user_id: user.sub  // Include the user ID expected by the server
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
  
      // Remove the deleted comment from the local state to update UI
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };
  

  const toggleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.message_content);
  };
  
  const saveEdit = async (commentId) => {
    if (!editContent.trim()) {
      alert("Comment content cannot be empty.");
      return;  // Prevent submitting empty comments
    }
    
    // Call your API to save the edited comment
    const token = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: user.sub, message_content: editContent }),
    });
  
    if (response.ok) {
      const updatedComment = await response.json();
      setComments(prevComments => prevComments.map(comment => comment._id === commentId ? { ...comment, message_content: editContent } : comment));
      setEditingCommentId(null);  // Reset editing mode
      alert("Comment edited successfully.");
    } else {
      alert("Failed to edit comment. Please try again.");
    }
  };
  
  

  useEffect(() => {
    // Fetch comments for the location
    const fetchComments = async () => {
      try {
        const locResponse = await fetch(`http://localhost:8080/api/locations/${locationId}`);
        if (!locResponse.ok) throw new Error('Failed to fetch location details');
        const locData = await locResponse.json();
        setLocationDetails(locData[0]);

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
      const token = await getAccessTokenSilently({
        audience: `http://localhost:8080`,
        scope: 'openid profile email read:current_user update:current_user_metadata'
      });
      console.log(token)
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

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent(""); // Optionally clear editContent or reset to original
  };

  const handleLike = async (commentId) => {
    const token = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (response.ok) {
      setComments(prevComments => prevComments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        return comment;
      }));
    } else {
      console.error("Failed to like the comment.");
      alert('Failed to process like. Please try again.');
    }
  };
  
  const handleDislike = async (commentId) => {
    const token = await getAccessTokenSilently();
    const response = await fetch(`http://localhost:8080/api/locations/${locationId}/comments/${commentId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  
    if (response.ok) {
      setComments(prevComments => prevComments.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, dislikes: comment.dislikes + 1 };
        }
        return comment;
      }));
    } else {
      console.error("Failed to dislike the comment.");
      alert('Failed to process dislike. Please try again.');
    }
  };
  
  if (!locationDetails) return <div>Loading location details...</div>;


  return (
    <div>
      <div className="mb-4">
      <LocationInfo locationDetails={locationDetails}/>
      <button
          onClick={() => window.history.back()}
          className="btn btn-primary btn-outline mt-2 mr-2"
          >
          Go Back
      </button>
      <button className="btn btn-accent mt-2" onClick={goToLocationDetails}>
          View Location Details
        </button>
        <textarea
          className="textarea textarea-bordered w-full mt-3"
          placeholder="Write your comment here..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="btn btn-secondary mt-2" onClick={handlePostComment}>Post Comment</button>
      </div>
      {comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <div key={comment._id} className="p-4 mb-4 border border-gray-300 rounded shadow-sm">
              {editingCommentId === comment._id ? (
                <>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button className="btn btn-success mr-2" onClick={() => saveEdit(comment._id)}>Save</button>
                  <button className="btn btn-error" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <p>{comment.message_content}</p>
                  <p>Posted by: {comment.username}</p>
                  {isAuthenticated && user.sub === comment.user_id && (
                    <>
                      <button className="btn btn-warning mr-2" onClick={() => toggleEdit(comment)}>Edit</button>
                      <button className="btn btn-error" onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                    </>
                  )}
                  <div className="flex items-center ml-4">
                    <button onClick={() => handleLike(comment._id)} className="text-blue-500 hover:text-blue-600 mr-2">
                      <FontAwesomeIcon icon={faThumbsUp} /> ({comment.likes})
                    </button>
                    <button onClick={() => handleDislike(comment._id)} className="text-red-500 hover:text-red-600">
                      <FontAwesomeIcon icon={faThumbsDown} /> ({comment.dislikes})
                    </button>
                  </div>
                </>
              )}  
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