import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { FaTrashAlt, FaPencilAlt, FaTimes } from 'react-icons/fa'
import './App.css'


function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
      setShowAddModal(false);
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

  // Handle editing a task
  const editTask = async (taskId, updatedFields) => {
    try {
      const response = await fetch(`http://localhost:5093/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        throw new Error("Failed to edit task.");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      setSelectedTask(updatedTask);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  const startEditing = () => {
    if (!selectedTask) return;
    setIsEditing(true);
    setEditTitle(selectedTask.title);
    setEditDescription(selectedTask.description || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description || "");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    await editTask(selectedTask.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  };

  // Handle clicking outside the modal to close it
  const handleModalClick = (e) => {
    if (e.target.classList.contains("modal")) {
      setShowAddModal(false);
      setShowDetailModal(false);
      setIsEditing(false);
    }
  };

  // Handle clicking a task card to open details modal
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
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
            <span className="close" onClick={() => setShowAddModal(false)}><FaTimes/></span>
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
              {!isEditing ? (
                <span className="edit" onClick={startEditing}><FaPencilAlt /></span>
              ) : (
                <span className="cancel-edit" onClick={handleCancelEdit}>Cancel</span>
              )}
              <span className="close" onClick={() => { setShowDetailModal(false); setIsEditing(false); }}><FaTimes /></span>
            </div>
            {!isEditing ? (
              <>
                <h2>{selectedTask.title}</h2>
                <p>{selectedTask.description || "No description"}</p>
                <p>Status: {selectedTask.isCompleted ? "Completed" : "Incomplete"}</p>
              </>
            ) : (
              <form onSubmit={handleSaveEdit} className="task-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button type="submit">Save</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;