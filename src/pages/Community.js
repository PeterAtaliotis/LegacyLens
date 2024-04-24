// import React, { useState } from 'react';

// function MessageBoard() {
//   const [messages, setMessages] = useState([]);

//   const postMessage = (message) => {
//     setMessages([...messages, { ...message, id: Date.now(), likes: 0, dislikes: 0 }]);
//   };

//   const likeMessage = (id) => {
//     setMessages(
//       messages.map((msg) => (msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg))
//     );
//   };

//   const dislikeMessage = (id) => {
//     setMessages(
//       messages.map((msg) => (msg.id === id ? { ...msg, dislikes: msg.dislikes + 1 } : msg))
//     );
//   };

//   const deleteMessage = (id) => {
//     setMessages(messages.filter((msg) => msg.id !== id));
//   };

//   return (
//     <div>
//       <div>
//         {messages.map((msg) => (
//           <div key={msg.id} className="p-4 m-2 bg-gray-100 rounded">
//             <p>{msg.content}</p>
//             <div>
//               <button onClick={() => likeMessage(msg.id)}>Like ({msg.likes})</button>
//               <button onClick={() => dislikeMessage(msg.id)}>Dislike ({msg.dislikes})</button>
//               <button onClick={() => deleteMessage(msg.id)}>Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div>
//         <MessageForm onPost={postMessage} />
//       </div>
//     </div>
//   );
// }

// function MessageForm({ onPost }) {
//   const [content, setContent] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onPost({ content });
//     setContent('');
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
//       <textarea
//         className="textarea textarea-bordered"
//         placeholder="Write something..."
//         value={content}
//         onChange={(e) => setContent(e.target.value)}
//       ></textarea>
//       <button type="submit" className="btn btn-primary">
//         Post
//       </button>
//     </form>
//   );
// }

// export default MessageBoard;
