"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TaskForm from "../../../components/TaskForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    category: "LOAN",
    title: "",
    customer_name: "",
    customer_phone: "",
    note: "",
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
        setTasks(data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.customer_name || !formData.customer_phone) {
      toast.error("Please search and select a valid loan number first");
      return;
    }

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
      category: task.category || "LOAN",
      title: task.title || "",
      customer_name: task.customer_name || "",
      customer_phone: task.customer_phone || "",
      note: task.note || task.description || "",
      status: task.status || "PENDING",
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
      category: "LOAN",
      title: "",
      customer_name: "",
      customer_phone: "",
      note: "",
      status: "PENDING",
    });
    setEditingTask(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const titleA = String(a.title || "").toLowerCase();
    const titleB = String(b.title || "").toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const filteredTasks = sortedTasks.filter((task) => {
    const matchesStatus = statusFilter === "ACTIVE" ? task.status !== "COMPLETED" : task.status === "COMPLETED";
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [
      task.title,
      task.customer_name,
      task.customer_phone,
      task.note,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === "ACTIVE" ? "bg-[#17312d] text-[#dfc797]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === "COMPLETED" ? "bg-[#17312d] text-[#dfc797]" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Complete
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by serial, name or mobile"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#dfc797]"
          />
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-bold shadow-sm transition-all"
        >
          + Add Task
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Serial No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <>
                    <tr key={task.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatDisplayText(task.title, "-")}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{formatDisplayText(task.customer_name, "-")}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{task.customer_phone || "-"}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleStatus(task)}
                            className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${task.status === "COMPLETED" ? "bg-gray-100 text-gray-600" : "bg-[#dfc797] text-[#17312d] hover:bg-[#f0d9ae]"}`}
                          >
                            {task.status === "COMPLETED" ? "Completed" : "Complete"}
                          </button>
                          <button
                            onClick={() => handleEdit(task)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr key={`${task.id}-note`} className="bg-gray-50">
                      <td colSpan="4" className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap wrap-break-word">
                        <span className="font-medium text-gray-600">Note:</span>{" "}
                        {formatDisplayText(task.note || task.description, "-")}
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {
        showForm && (
          <TaskForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editingTask={editingTask}
          />
        )
      }
    </div >
  );
}
