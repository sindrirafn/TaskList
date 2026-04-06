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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [filter, setFilter] = useState("all");

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


  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  // Utility function to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
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

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setShowConfirmDelete(false);
      setTaskToDelete(null);
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
      <div className="app-header">
        <h1>Task Tracker</h1>
        <button className='primary-btn' type='submit' onClick={() => setShowAddModal(true)}>+ Add Task</button>
      </div>

      {/* <p><b>{tasks.length}</b> total | <b>{tasks.filter(t => !t.isCompleted).length}</b> active | <b>{tasks.filter(t => t.isCompleted).length}</b> completed</p> */}
      <div className="task-toolbar">
        <p className="task-summary">
          <strong>{tasks.length}</strong> total
          <span className="separator">|</span>
          <strong>{tasks.filter((t) => !t.isCompleted).length}</strong> active
          <span className="separator">|</span>
          <strong>{tasks.filter((t) => t.isCompleted).length}</strong> completed
        </p>

        <div className="filter-group">
          <button
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          |
          <button
            className={filter === "active" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          |
          <button
            className={filter === "completed" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal" onClick={handleModalClick}>
          <div className="modal-content">
            <div className="addtask-modal-header">
              <h2>Add Task</h2>
              <span className="close" onClick={() => setShowAddModal(false)}><FaTimes /></span>
            </div>
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
              <button className="primary-btn" type="submit">
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="task-list">
        {filteredTasks.map((task) => (
          <div className="task-card" key={task.id} onClick={() => handleTaskClick(task)}>
            <div className="task-row">
              <input
                type="checkbox"
                className='completed-checkbox'
                checked={task.isCompleted}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleCompletion(task.id, task.isCompleted);
                }}
              />
              <div className="task-content">
                <h3 className={task.isCompleted ? 'completed' : ''}>{task.title}</h3>
                <p className={task.isCompleted ? 'completed' : ''}>{task.description || "No description"}</p>
              </div>
              <div>
                  <span className={`badge ${task.isCompleted ? "completed" : "active"}`}>
                    {task.isCompleted ? "Completed" : "Active"}
                  </span>
                </div>

              <div className="task-actions">
                <button
                  className="btn-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setIsEditing(true);
                    setEditTitle(task.title);
                    setEditDescription(task.description || "");
                    setShowDetailModal(true);
                  }}
                  title="Edit"
                >
                  <FaPencilAlt />
                </button>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task);
                    setShowConfirmDelete(true);
                  }}
                  title="Delete"
                >
                  <FaTrashAlt />
                </button>
              </div>            </div>
          </div>
        ))}
      </div>
      {showDetailModal && selectedTask && (
        <div className="modal" onClick={handleModalClick}>
          <div className="modal-content">
            <div className="button-group">
              <span className="delete" onClick={() => { setTaskToDelete(selectedTask); setShowConfirmDelete(true); }}><FaTrashAlt /></span>
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
                <p className="description">{selectedTask.description || "No description"}</p>
                <div className="meta">
                  <span className={`badge ${selectedTask.isCompleted ? "completed" : "active"}`}>
                    {selectedTask.isCompleted ? "Completed" : "Active"}
                  </span>
                </div>
                <div className="meta">
                  <span>Created:</span>
                  <span>{formatDate(selectedTask.createdAt)}</span>
                </div>
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
                <div className="modal-actions">
                  <button className="secondary-btn" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button className="primary-btn" type="submit">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showConfirmDelete && (
        <div className="modal" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmation</h2>
              <span className="close" onClick={() => setShowConfirmDelete(false)}><FaTimes /></span>
            </div>
            <p>Are you sure you want to delete this task?</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmDelete(false)}>Cancel</button>
              <button className="delete-btn" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;