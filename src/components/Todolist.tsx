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

const Todolist: React.FC = () => {
  const [tasks, setTasks] = useState<Todolist[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'Tất cả' | 'Đang làm' | 'Hoàn thành'>('Tất cả');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/todoList")
      .then(response => {
        const sortedTasks = response.data.sort((a: Todolist, b: Todolist) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setTasks(sortedTasks);
        setLoading(false);
      })
      .catch(error => {
        console.error("Đã xảy ra lỗi khi lấy danh sách công việc!", error);
        setLoading(false);
      });
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    if (tasks.some(task => task.name === newTask.trim())) {
      swal("Lỗi", "Tên công việc đã tồn tại!", "error");
      return;
    }

    const newTaskObj = { name: newTask, completed: false, created_at: new Date() };
    axios.post("http://localhost:8080/todoList", newTaskObj)
      .then(response => {
        setTasks([...tasks, response.data]);
        setNewTask('');
      })
      .catch(error => {
        console.error("Đã xảy ra lỗi khi thêm công việc mới!", error);
      });
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
        console.error("Đã xảy ra lỗi khi cập nhật công việc!", error);
      });
  };

  const handleDeleteTask = (id: number) => {
    swal({
      title: "Bạn có chắc chắn?",
      text: "Khi xóa, bạn sẽ không thể khôi phục lại công việc này!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete(`http://localhost:8080/todoList/${id}`)
          .then(() => {
            setTasks(tasks.filter(task => task.id !== id));
            swal("Đã xóa công việc của bạn!", {
              icon: "success",
            });
          })
          .catch(error => {
            console.error("Đã xảy ra lỗi khi xóa công việc!", error);
          });
      } else {
        swal("Công việc của bạn vẫn an toàn!");
      }
    });
  };

  const handleEditTask = (id: number, name: string) => {
    setEditingTaskId(id);
    setEditedTaskName(name);
  };

  const handleSaveEdit = (id: number) => {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const updatedTask = { ...task, name: editedTaskName };

    axios.put(`http://localhost:8080/todoList/${id}`, updatedTask)
      .then(response => {
        setTasks(tasks.map(task => task.id === id ? response.data : task));
        setEditingTaskId(null);
        setEditedTaskName('');
      })
      .catch(error => {
        console.error("Đã xảy ra lỗi khi lưu công việc chỉnh sửa!", error);
      });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'Đang làm') return !task.completed;
    if (filter === 'Hoàn thành') return task.completed;
    return true;
  });

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
                        className="form-control"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Công việc mới..."
                      />
                    </div>
                    <button type="submit" className="btn btn-info ms-2">Thêm</button>
                  </form>

                  <ul className="nav nav-tabs mb-4 pb-2">
                    {['Tất cả', 'Đang làm', 'Hoàn thành'].map(status => (
                      <li key={status} className="nav-item">
                        <button
                          className={`nav-link ${filter === status ? 'active' : ''}`}
                          onClick={() => setFilter(status as 'Tất cả' | 'Đang làm' | 'Hoàn thành')}
                        >
                          {status}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="tab-content" style={{ maxHeight: "250px", overflowY: "auto" }}>
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
                                    Lưu
                                  </button>
                                ) : (
                                  <>
                                    <button onClick={() => handleEditTask(task.id, task.name)} className="fa-solid fa-pen" aria-label="Chỉnh sửa"></button>
                                    <button onClick={() => handleDeleteTask(task.id)} className="fa-solid fa-trash" aria-label="Xóa"></button>
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
};

export default Todolist;
