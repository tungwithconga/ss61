import React, { useEffect, useState } from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./todolist.css";
import axios from 'axios';
import swal from 'sweetalert';

interface Todolist {
  id: number;
  name: string;
  completed: boolean;
  created_at: Date;
}

export default function Todolist() {
  const [tasks, setTasks] = useState<Todolist[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('All');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    axios.get("http://localhost:8080/todoList")
      .then(response => {
        setTimeout(() => {
          const sortedTasks = response.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setTasks(sortedTasks);
          setLoading(false);
        }, 1000);
      })
      .catch(error => {
        console.error("There was an error fetching the todo list!", error);
        setLoading(false);
      });
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    if (tasks.some(task => task.name === newTask.trim())) {
      swal("Error", "Task name already exists!", "error");
      return;
    }

    const newTaskObj = { name: newTask, completed: false, created_at: new Date() };
    axios.post("http://localhost:8080/todoList", newTaskObj)
      .then(response => {
        setTasks([...tasks, response.data]);
      })
      .catch(error => {
        console.error("There was an error adding the new task!", error);
      });

    setNewTask('');
  };

  const handleToggleTask = (id: number) => {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    axios.put(`http://localhost:8080/todoList/${id}`, updatedTask)
      .then(response => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));
      })
      .catch(error => {
        console.error("There was an error updating the task!", error);
      });
  };

  const handleDeleteTodo = (id: number) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this task!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(`http://localhost:8080/todoList/${id}`)
          .then(() => {
            setTasks(tasks.filter(task => task.id !== id));
            setShowModal(false);
            swal("Poof! Your task has been deleted!", {
              icon: "success",
            });
          })
          .catch(error => {
            console.error("There was an error deleting the task!", error);
          });
      } else {
        swal("Your task is safe!");
      }
    });
  };

  const handleEditTodo = (id: number, name: string) => {
    setEditingTaskId(id);
    setEditedTaskName(name);
  };

  const handleSaveEdit = (id: number) => {
    const updatedTask = { ...tasks.find(task => task.id === id), name: editedTaskName };

    axios.put(`http://localhost:8080/todoList/${id}`, updatedTask)
      .then(response => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));
        setEditingTaskId(null);
        setEditedTaskName('');
      })
      .catch(error => {
        console.error("There was an error saving the edited task!", error);
      });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const openModal = (id: number) => {
    setDeleteId(id);
    setShowModal(true);
  };

  return (
    <div>
      <section className="vh-100 gradient-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card">
                <div className="card-body p-5">
                  <form className="d-flex justify-content-center align-items-center mb-4" onSubmit={handleAddTask}>
                    <div className="form-outline flex-fill">
                      <input
                        type="text"
                        id="form2"
                        className="form-control"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                      />
                      <label className="form-label" htmlFor="form2">
                        New task...
                      </label>
                    </div>
                    <button type="submit" className="btn btn-info ms-2">
                      Add
                    </button>
                  </form>

                  <ul className="nav nav-tabs mb-4 pb-2" id="ex1" role="tablist">
                    <li className="nav-item" role="presentation">
                      <a
                        className={`nav-link ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                        role="tab"
                        aria-selected={filter === 'All'}
                      >
                        All
                      </a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a
                        className={`nav-link ${filter === 'Active' ? 'active' : ''}`}
                        onClick={() => setFilter('Active')}
                        role="tab"
                        aria-selected={filter === 'Active'}
                      >
                        Active
                      </a>
                    </li>
                    <li className="nav-item" role="presentation">
                      <a
                        className={`nav-link ${filter === 'Completed' ? 'active' : ''}`}
                        onClick={() => setFilter('Completed')}
                        role="tab"
                        aria-selected={filter === 'Completed'}
                      >
                        Completed
                      </a>
                    </li>
                  </ul>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                                      ) : (
                    <div className="tab-content"style={{ maxHeight: "250px", overflowY: "auto" }}>
                      <div className="tab-pane fade show active">
                        <ul className="list-group mb-0">
                          {filteredTasks.map(task => (
                            <li
                              key={task.id}
                              className="list-group-item d-flex align-items-center border-0 mb-2 rounded"
                              style={{ backgroundColor: "#f4f6f7", display: "flex", justifyContent: "space-between" }}
                            >
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                              />
                              {editingTaskId === task.id ? (
                                <input
                                  type="text"
                                  value={editedTaskName}
                                  onChange={(e) => setEditedTaskName(e.target.value)}
                                  onBlur={() => handleSaveEdit(task.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit(task.id);
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : task.completed ? (
                                <s>{task.name}</s>
                              ) : (
                                task.name
                              )}
                              <div style={{ display: "flex", gap: "20px" }}>
                                {editingTaskId === task.id ? (
                                  <button onClick={() => handleSaveEdit(task.id)} className="btn btn-success btn-sm">
                                    Save
                                  </button>
                                ) : (
                                  <>
                                    <button onClick={() => handleEditTodo(task.id, task.name)} className="fa-solid fa-pen"></button>
                                    <button onClick={() => handleDeleteTodo(task.id)} className="fa-solid fa-trash"></button>
                                  </>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

                 
