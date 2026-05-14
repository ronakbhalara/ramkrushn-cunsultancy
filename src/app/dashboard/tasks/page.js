"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import TaskForm from "../../../components/TaskForm";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("LOAN");

  const [formData, setFormData] = useState({
    category: "LOAN",
    title: "",
    description: "",
    due_date: "",
    status: "PENDING",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingTask ? "Task updated successfully!" : "Task added successfully!"
        );
        resetForm();
        fetchTasks();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      category: task.category,
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || "",
      status: task.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Task deleted successfully!");
        fetchTasks();
      } else {
        toast.error(data.message || "Failed to delete task");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...task, status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Task marked as ${newStatus.toLowerCase()}`);
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const resetForm = () => {
    setFormData({
      category: categoryFilter,
      title: "",
      description: "",
      due_date: "",
      status: "PENDING",
    });
    setEditingTask(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const getDueDateColor = (dueDate) => {
    if (!dueDate) return "text-gray-500";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 font-bold";
    if (diffDays <= 3) return "text-yellow-600 font-bold";
    return "text-green-600 font-bold";
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const filteredTasks = sortedTasks.filter((task) => task.category === categoryFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setCategoryFilter("LOAN")}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 transform ${categoryFilter === "LOAN"
              ? "bg-[#17312d] text-[#dfc797] shadow-md scale-105"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            💰 Loan
          </button>
          <button
            onClick={() => setCategoryFilter("INCOME_TAX")}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 transform ${categoryFilter === "INCOME_TAX"
              ? "bg-[#17312d] text-[#dfc797] shadow-md scale-105"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            🧾 Income Tax
          </button>
          <button
            onClick={() => setCategoryFilter("GST")}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 transform ${categoryFilter === "GST"
              ? "bg-[#17312d] text-[#dfc797] shadow-md scale-105"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            📋 GST
          </button>
        </div>

        <button
          onClick={() => {
            setFormData({ ...formData, category: categoryFilter });
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-bold shadow-sm transition-all flex items-center gap-2 text-sm"
        >
          <span>+</span> Add New Task
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">Click "Add New Task" to create your first task for this category.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 border-l-4 ${task.status === "COMPLETED" ? "border-green-400 opacity-80" : "border-[#dfc797]"
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className={`text-md font-bold text-gray-900 ${task.status === "COMPLETED" ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </h3>
                  {task.due_date && (
                    <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${getDueDateColor(task.due_date)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      📅 Due: {new Date(task.due_date).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {task.description && (
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mb-3 min-h-[60px]">
                  <p className="text-gray-600 text-[13px] break-words whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${task.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {task.status}
                </span>
                <button
                  onClick={() => toggleStatus(task)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${task.status === "COMPLETED"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-[#17312d] text-[#dfc797] hover:bg-[#1b3934]"
                    }`}
                >
                  {task.status === "COMPLETED" ? "Pending" : "Mark Done"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}
