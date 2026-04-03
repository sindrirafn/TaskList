import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { FaTrash, FaEdit, FaTimes, FaXbox, FaTrashAlt, FaRegEdit, FaPencilAlt, FaXing } from 'react-icons/fa'
import 'react-icons/fa'
import 'react-icons/fa6'
import './App.css'
import { FaXmark, FaXmarksLines } from 'react-icons/fa6'

// function App() {
//   const [count, setCount] = useState(0)
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:5093/tasks')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         setTasks(data);
//         setLoading(false);
//       })
//       .catch(error => {
//         setError(error.message);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Task List</h1>
//           <p>
//             Keep track of what needs to be done and what has been completed.
//           </p>
//         </div>
//         <button
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//         {loading && <p>Loading tasks...</p>}
//         {error && <p>Error: {error}</p>}
//         {!loading && !error && (
//           <ul>
//             {tasks.map(task => (
//               <li key={task.id}>{task.title}</li>
//             ))}
//           </ul>
//         )}
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks from the API when the component mounts
  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5093/tasks");

        if (!response.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);


  // Handle form submission to add a new task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5093/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error("Failed to add task.");
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setTitle("");
      setDescription("");
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  // Handle toggling task completion status
  const toggleCompletion = async (taskId, isCompleted) => {
    try {
      const response = await fetch(`http://localhost:5093/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isCompleted: !isCompleted })
      });

      if (!response.ok) {
        throw new Error("Failed to toggle task completion.");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  // Handle deleting a task
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5093/tasks/${taskId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete task.");
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setShowDetailModal(false);
  }

  // Handle clicking outside the modal to close it
  const handleModalClick = (e) => {
    if (e.target.classList.contains("modal")) {
      setShowAddModal(false);
      setShowDetailModal(false);
    }
  };

  // Handle clicking a task card to open details modal
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };


  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="app">
      <h1>Task Tracker</h1>
      <p>{tasks.length} tasks found</p>
      <button onClick={() => setShowAddModal(true)}>+ Add Task</button>

      {showAddModal && (
        <div className="modal" onClick={handleModalClick}>
          <div className="modal-content">
            <span className="close" onClick={() => setShowAddModal(false)}><FaXmark/></span>
            <form onSubmit={handleSubmit} className="task-form">
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button type="submit">Add Task</button>
            </form>
          </div>
        </div>
      )}

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-card" key={task.id} onClick={() => handleTaskClick(task)}>
            <div className="task-row">
              <input
                type="checkbox"
                checked={task.isCompleted}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleCompletion(task.id, task.isCompleted);
                }}
              />
              <div className="task-content">
                <h3>{task.title}</h3>
                <p>{task.description || "No description"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showDetailModal && selectedTask && (
        <div className="modal" onClick={handleModalClick}>
          <div className="modal-content">
            <div className="button-group">  
              <span className="delete" onClick={() => deleteTask(selectedTask.id)}><FaTrashAlt /></span>
              <span className="edit"><FaPencilAlt /></span>
              <span className="close" onClick={() => setShowDetailModal(false)}><FaTimes /></span>
            </div>
            <h2>{selectedTask.title}</h2>
            <p>{selectedTask.description || "No description"}</p>
            <p>Status: {selectedTask.isCompleted ? "Completed" : "Incomplete"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;