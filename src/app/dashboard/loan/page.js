"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import LoanForm from "../../../components/LoanForm";
import DocumentsSection from "../../../components/DocumentsSection";
import TaskForm from "../../../components/TaskForm";

export default function LoanPage() {
  const [loans, setLoans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    phone_no_2: "",
    email_id: "",
    loan_status: "",
    loan_type: "",
    reference_name: "",
    reference_phone: "",
    stage: "ACTIVE",
    bank_name: "",
    loan_ac_no: "",
    loan_amount: "",
    emi_date: "",
    emi_amount: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLoans();
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
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans");
      const data = await response.json();
      if (data.success) {
        setLoans(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      newErrors.phone_no = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // Phone 2 validation (optional but if provided must be valid)
    if (formData.phone_no_2 && !phoneRegex.test(formData.phone_no_2)) {
      newErrors.phone_no_2 = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email_id && !emailRegex.test(formData.email_id)) {
      newErrors.email_id = "Please enter a valid email address";
    }

    // Reference Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    if (formData.reference_phone && !phoneRegex.test(formData.reference_phone)) {
      newErrors.reference_phone = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (selectedFiles) => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitFormData = new FormData();

      // Add all form fields
      submitFormData.append('name', formData.name);
      submitFormData.append('phone_no', formData.phone_no);
      submitFormData.append('phone_no_2', formData.phone_no_2 || '');
      submitFormData.append('email_id', formData.email_id);
      submitFormData.append('loan_status', formData.loan_status);
      submitFormData.append('loan_type', formData.loan_type);
      submitFormData.append('reference_name', formData.reference_name);
      submitFormData.append('reference_phone', formData.reference_phone);
      submitFormData.append('stage', formData.stage);
      submitFormData.append('bank_name', formData.bank_name);
      submitFormData.append('loan_ac_no', formData.loan_ac_no);
      submitFormData.append('loan_amount', formData.loan_amount);
      submitFormData.append('emi_date', formData.emi_date);
      submitFormData.append('emi_amount', formData.emi_amount);
      submitFormData.append('notes', formData.notes);

      // Add files if any
      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          submitFormData.append('files', file);
        });
      }

      const url = editingLoan
        ? `/api/loans/${editingLoan.id}`
        : "/api/loans";
      const method = editingLoan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingLoan ? "Loan updated successfully!" : "Loan added successfully!"
        );
        resetForm();
        fetchLoans();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData({
      name: loan.name,
      phone_no: loan.phone_no,
      phone_no_2: loan.phone_no_2 || "",
      email_id: loan.email_id || "",
      loan_status: loan.loan_status || "",
      loan_type: loan.loan_type || "",
      reference_name: loan.reference_name || "",
      reference_phone: loan.reference_phone || "",
      stage: loan.stage,
      bank_name: loan.bank_name || "",
      loan_ac_no: loan.loan_ac_no || "",
      loan_amount: loan.loan_amount,
      emi_date: loan.emi_date || "",
      emi_amount: loan.emi_amount || "",
      notes: loan.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this loan?")) return;

    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Loan deleted successfully!");
        fetchLoans();
      } else {
        toast.error(data.message || "Failed to delete loan");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_no: "",
      phone_no_2: "",
      email_id: "",
      loan_status: "",
      loan_type: "",
      reference_name: "",
      reference_phone: "",
      stage: "ACTIVE",
      bank_name: "",
      loan_ac_no: "",
      loan_amount: "",
      emi_date: "",
      emi_amount: "",
      notes: "",
    });
    setErrors({});
    setEditingLoan(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const [taskFormData, setTaskFormData] = useState({
    category: "LOAN",
    title: "",
    description: "",
    due_date: "",
    status: "PENDING",
  });

  const handleTaskSubmit = async () => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...taskFormData, category: "LOAN" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingTask ? "Task updated successfully!" : "Task added successfully!"
        );
        resetTaskForm();
        fetchTasks();
        setShowTaskForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setTaskFormData({
      category: task.category,
      title: task.title,
      description: task.description || "",
      due_date: task.due_date || "",
      status: task.status,
    });
    setShowTaskForm(true);
  };

  const handleTaskDelete = async (id) => {
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

  const toggleTaskStatus = async (task) => {
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

  const resetTaskForm = () => {
    setTaskFormData({
      category: "LOAN",
      title: "",
      description: "",
      due_date: "",
      status: "PENDING",
    });
    setEditingTask(null);
  };

  const handleTaskCancel = () => {
    resetTaskForm();
    setShowTaskForm(false);
  };

  const getDueDateColor = (dueDate, status) => {
    if (!dueDate) return "text-gray-500";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-600 font-bold";
    if (diffDays <= 5) return "text-yellow-600 font-bold";
    return "text-green-600 font-bold";
  };

  const toggleLoanDetails = (loanId) => {
    setExpandedLoan(expandedLoan === loanId ? null : loanId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="sm:flex block justify-between items-center mb-6">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Loan Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "ALL"
                ? "bg-[#dfc797] text-[#17312d]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "ACTIVE"
                ? "bg-[#dfc797] text-[#17312d]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETE")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "COMPLETE"
                ? "bg-[#dfc797] text-[#17312d]"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Complete
            </button>
          </div>

          {/* Task Filters */}
          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setStatusFilter("TASK")}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === "TASK"
                ? "bg-white text-[#17312d] shadow-sm border border-gray-200"
                : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              Pending Task
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED_TASK")}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === "COMPLETED_TASK"
                ? "bg-white text-[#17312d] shadow-sm border border-gray-200"
                : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              Complete Task
            </button>
          </div>
        </div>
        <button
          onClick={() => statusFilter === "TASK" || statusFilter === "COMPLETED_TASK" ? setShowTaskForm(true) : setShowForm(true)}
          className="px-4 py-2 sm:mt-0 mt-5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
        >
          {statusFilter === "TASK" || statusFilter === "COMPLETED_TASK" ? "Add New Task" : "Add New Loan"}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LoanForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingLoan={editingLoan}
        />
      )}

      {showTaskForm && (
        <TaskForm
          formData={taskFormData}
          setFormData={setTaskFormData}
          onSubmit={handleTaskSubmit}
          onCancel={handleTaskCancel}
          editingTask={editingTask}
        />
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              {statusFilter === "TASK" || statusFilter === "COMPLETED_TASK" ? (
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Series Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone Numbers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loan Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loan Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loan Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bank Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statusFilter === "TASK" || statusFilter === "COMPLETED_TASK" ? (
                tasks.filter(t => t.category === "LOAN" && (statusFilter === "TASK" ? t.status !== "COMPLETED" : t.status === "COMPLETED")).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No {statusFilter === "TASK" ? "pending" : "completed"} loan tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.filter(t => t.category === "LOAN" && (statusFilter === "TASK" ? t.status !== "COMPLETED" : t.status === "COMPLETED")).map((task, index) => {
                    const rowBgClass = index % 2 === 0 ? 'bg-gray-100' : 'bg-white hover:bg-gray-50';
                    return (
                      <React.Fragment key={task.id}>
                        <tr className={`transition-colors ${rowBgClass} ${task.description ? 'border-b-0' : ''}`}>
                          <td className={`px-4 py-3 text-sm font-bold text-gray-900 ${task.status === "COMPLETED" ? "line-through text-gray-400" : ""}`}>
                            {task.title}
                          </td>
                          <td className={`px-4 py-3 text-sm ${getDueDateColor(task.due_date, task.status)}`}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN") : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${task.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${task.status === "COMPLETED" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                              >
                                {task.status === "COMPLETED" ? "Pending" : "Done"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTaskEdit(task); }}
                                className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTaskDelete(task.id); }}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {task.description && (
                          <tr className={`transition-colors ${rowBgClass}`}>
                            <td colSpan="4" className="px-4 pb-3 pt-0 text-sm">
                              <span className="font-bold text-gray-900">Note: </span>
                              <span className="font-semibold text-gray-800 whitespace-pre-wrap">{task.description}</span>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )
              ) : (
                loans.filter(loan => statusFilter === "ALL" || loan.stage === statusFilter).length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No {statusFilter === "ALL" ? "" : statusFilter.toLowerCase()} loans found. Click "Add New Loan" to get started.
                    </td>
                  </tr>
                ) : (
                  loans
                    .filter(loan => statusFilter === "ALL" || loan.stage === statusFilter)
                    .map((loan, index) => {
                      const rowBgClass = index % 2 === 0 ? 'bg-gray-100' : 'bg-white hover:bg-gray-50';
                      return (
                        <React.Fragment key={loan.id}>
                          <tr
                            className={`cursor-pointer transition-colors ${rowBgClass} ${loan.notes && expandedLoan !== loan.id ? 'border-b-0' : ''}`}
                            onClick={() => toggleLoanDetails(loan.id)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                              {loan.number_series}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {loan.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex flex-col gap-1">
                                <a
                                  href={`tel:${loan.phone_no}`}
                                  className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {loan.phone_no}
                                </a>
                                {loan.phone_no_2 && (
                                  <a
                                    href={`tel:${loan.phone_no_2}`}
                                    className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {loan.phone_no_2}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                {loan.loan_status || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {loan.loan_type || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              ₹{parseFloat(loan.loan_amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-700">
                              {loan.bank_name || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {loan.created_at ? new Date(loan.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              }) : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(loan);
                                  }}
                                  className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(loan.id);
                                  }}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {loan.notes && (
                            <tr
                              className={`cursor-pointer transition-colors ${rowBgClass}`}
                              onClick={() => toggleLoanDetails(loan.id)}
                            >
                              <td colSpan="7" className="px-4 pb-3 pt-0 text-sm">
                                <span className="font-bold text-gray-900">Note: </span>
                                <span className="font-semibold text-gray-800">{loan.notes}</span>
                              </td>
                            </tr>
                          )}
                          {expandedLoan === loan.id && (
                            <tr className="animate-in slide-in-from-top-1 duration-300">
                              <td colSpan="9" className="px-0 py-0">
                                <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Personal Information */}
                                    <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Name</p>
                                          <p className="font-medium text-gray-900">{loan.name}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Primary Phone</p>
                                          <a
                                            href={`tel:${loan.phone_no}`}
                                            className="font-medium text-[#17312d] hover:text-[#dfc797] hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {loan.phone_no}
                                          </a>
                                        </div>
                                        {loan.phone_no_2 && (
                                          <div>
                                            <p className="text-xs text-gray-500">Secondary Phone</p>
                                            <a
                                              href={`tel:${loan.phone_no_2}`}
                                              className="font-medium text-[#17312d] hover:text-[#dfc797] hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {loan.phone_no_2}
                                            </a>
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-xs text-gray-500">Email</p>
                                          <p className="font-medium text-gray-900">{loan.email_id || "-"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Loan Information */}
                                    <div className="animate-in fade-in-50 duration-500 delay-200">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Loan Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Bank Name</p>
                                          <p className="font-medium text-gray-900">{loan.bank_name || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Loan Account</p>
                                          <p className="font-medium text-gray-900">{loan.loan_ac_no || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Loan Amount</p>
                                          <p className="font-medium text-gray-900">₹{parseFloat(loan.loan_amount).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">EMI Amount</p>
                                          <p className="font-medium text-gray-900">₹{parseFloat(loan.emi_amount || 0).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">EMI Date</p>
                                          <p className="font-medium text-gray-900">
                                            {loan.emi_date ? new Date(loan.emi_date).toLocaleDateString('en-IN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric'
                                            }) : "-"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Reference Information */}
                                    <div className="animate-in fade-in-50 duration-500 delay-300">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Reference Name</p>
                                          <p className="font-medium text-gray-900">{loan.reference_name || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Reference Phone</p>
                                          <p className="font-medium text-gray-900">{loan.reference_phone || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Loan Status</p>
                                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                            {loan.loan_status || "-"}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Loan Type</p>
                                          <p className="font-medium text-gray-900">{loan.loan_type || "-"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Documents Section */}
                                  <DocumentsSection loanId={loan.id} />


                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

