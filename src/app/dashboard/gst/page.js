"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import GSTForm from "../../../components/GSTForm";
import GSTInfoModal from "../../../components/GSTInfoModal";
import { formatDisplayText } from "../../../utils/formatText";

export default function GSTPage() {
  const [gstRecords, setGstRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGST, setEditingGST] = useState(null);
  const [selectedGST, setSelectedGST] = useState(null);
  const [expandedGST, setExpandedGST] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGSTForInfo, setSelectedGSTForInfo] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    category: "GST",
    title: "",
    description: "",
    due_date: "",
    status: "PENDING",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    email_id: "",
    reference_name: "",
    reference_phone: "",
    company_name: "",
    pan_card_no: "",
    subject: "",
    gst_no: "",
    user_id: "",
    password: "",
    assessment_year: [],
    gst_filing_date: "",
    gst_filing_frequency: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

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

  const fetchGSTRecords = async () => {
    try {
      const response = await fetch("/api/gst");
      const data = await response.json();
      if (data.success) {
        setGstRecords(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch GST records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchGSTRecords();
      await fetchTasks();
    };

    void loadInitialData();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      console.log("Name validation failed");
      newErrors.name = "Name is required";
    }

    // Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      newErrors.phone_no = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // Reference Phone validation (Indian format: +91 followed by 10 digits or 10 digits)
    if (formData.reference_phone && !phoneRegex.test(formData.reference_phone)) {
      newErrors.reference_phone = "Please enter a valid Indian phone number (e.g., +919876543210 or 9876543210)";
    }

    // PAN Card validation (10 characters, first 5 letters, 4 numbers, 1 letter)
    if (formData.pan_card_no && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan_card_no.trim())) {
      newErrors.pan_card_no = "Please enter a valid PAN card number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called", formData);
    if (!validateForm()) {
      return;
    }

    try {
      const url = editingGST
        ? "/api/gst"
        : "/api/gst";
      const method = editingGST ? "PUT" : "POST";

      // Calculate default assessment year
      const getCurrentYear = new Date().getFullYear();
      const currentAssessmentYear = `${getCurrentYear}-${((getCurrentYear + 1) % 100).toString().padStart(2, '0')}`;

      const payload = {
        ...(editingGST ? { ...formData, id: editingGST.id } : formData),
        assessment_year: formData.assessment_year && formData.assessment_year.length > 0
          ? formData.assessment_year
          : [currentAssessmentYear]
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingGST ? "GST record updated successfully!" : "GST record added successfully!"
        );
        resetForm();
        fetchGSTRecords();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (gst) => {
    setEditingGST(gst);
    setFormData({
      name: gst.name,
      phone_no: gst.phone_no,
      reference_name: gst.reference_name || "",
      reference_phone: gst.reference_phone || "",
      company_name: gst.company_name || "",
      pan_card_no: gst.pan_card_no || "",
      subject: gst.subject || "",
      gst_no: gst.gst_no || "",
      user_id: gst.user_id || "",
      password: gst.password || "",
      email_id: gst.email_id || "",
      assessment_year: Array.isArray(gst.assessment_year)
        ? gst.assessment_year
        : [],
      gst_filing_date: gst.gst_filing_date || "",
      gst_filing_frequency: gst.gst_filing_frequency || "",
      note: gst.note || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this GST record?")) return;

    try {
      const response = await fetch(`/api/gst?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("GST record deleted successfully!");
        fetchGSTRecords();
      } else {
        toast.error(data.message || "Failed to delete GST record");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_no: "",
      email_id: "",
      reference_name: "",
      reference_phone: "",
      company_name: "",
      pan_card_no: "",
      subject: "",
      gst_no: "",
      user_id: "",
      password: "",
      assessment_year: [],
      gst_filing_date: "",
      gst_filing_frequency: "",
      note: "",
    });
    setErrors({});
    setEditingGST(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleTaskSubmit = async () => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...taskFormData, category: "GST" }),
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
      category: "GST",
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

  const handleInfo = (gst) => {
    setSelectedGSTForInfo(gst);
    setShowInfoModal(true);
  };

  const handleInfoSubmit = async (documentData) => {
    try {
      const formData = new FormData();

      // Append all form fields
      Object.keys(documentData).forEach(key => {
        if (key === 'images' && Array.isArray(documentData[key])) {
          documentData[key].forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, documentData[key]);
        }
      });

      // Append additional fields
      if (selectedGSTForInfo?.documentData) {
        // Update existing document
        formData.append('document_id', selectedGSTForInfo.documentData.id);

        const response = await fetch("/api/gst-documents", {
          method: "PUT",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          toast.success("GST document updated successfully!");
        } else {
          toast.error(data.message || "Failed to update GST document");
        }
      } else {
        // Create new document
        formData.append('gst_record_id', selectedGSTForInfo.id);
        // document_path will be set by environment variable on server side

        try {
          const response = await fetch("/api/gst-documents", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (data.success) {
            toast.success("GST document saved successfully!");
          } else {
            toast.error(data.message || "Failed to save GST document");
          }
        } catch (error) {
          toast.error("Network error");
        }
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const toggleGSTDetails = (gstId) => {
    setExpandedGST(expandedGST === gstId ? null : gstId);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyValue = async (value, label) => {
    const text = String(value ?? "").trim();

    if (!text) {
      toast.error(`${label} is empty`);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch (error) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const isTaskCompletedThisMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const getCurrentDay = () => new Date().getDate();
  const shouldClearGSTTab = getCurrentDay() > 20;
  const isTaskWindowOpen = () => {
    const day = getCurrentDay();
    return day >= 1 && day <= 20;
  };

  const isGSTR1Completed = (gst) => isTaskCompletedThisMonth(gst.last_gstr1_filed_date);
  const isGSTR3BCompleted = (gst) => isTaskCompletedThisMonth(gst.last_gstr3b_filed_date);
  const isGSTTaskPending = (gst) => !isGSTR1Completed(gst) || !isGSTR3BCompleted(gst);
  const isGSTTaskCompleted = (gst) => isGSTR1Completed(gst) && isGSTR3BCompleted(gst);

  const handleTaskComplete = async (id, taskType) => {
    const currentRecord = gstRecords.find((gst) => gst.id === id);

    if (!currentRecord) return;

    const optimisticTimestamp = new Date().toISOString();

    setGstRecords((prevRecords) =>
      prevRecords.map((gst) => {
        if (gst.id !== id) return gst;

        if (taskType === 'GSTR-1') {
          return { ...gst, last_gstr1_filed_date: optimisticTimestamp };
        }

        return { ...gst, last_gstr3b_filed_date: optimisticTimestamp };
      })
    );

    try {
      const response = await fetch('/api/gst/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taskType }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`${taskType} marked as complete!`);
        await fetchGSTRecords();
      } else {
        setGstRecords((prevRecords) =>
          prevRecords.map((gst) => {
            if (gst.id !== id) return gst;
            return currentRecord;
          })
        );
        toast.error(data.message || `Failed to update ${taskType}`);
      }
    } catch (error) {
      setGstRecords((prevRecords) =>
        prevRecords.map((gst) => {
          if (gst.id !== id) return gst;
          return currentRecord;
        })
      );
      toast.error('Network error');
    }
  };

  const filteredGSTRecords = gstRecords.filter(gst => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    if (gst.number_series && gst.number_series.toString().toLowerCase().includes(query)) return true;
    if (gst.name && gst.name.toLowerCase().includes(query)) return true;
    if (gst.phone_no && gst.phone_no.toLowerCase().includes(query)) return true;
    if (gst.phone_no_2 && gst.phone_no_2.toLowerCase().includes(query)) return true;

    return false;
  });

  const gstTabRecordsToShow = statusFilter === "GST" && shouldClearGSTTab ? [] : filteredGSTRecords;

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
          {/* GST Filters */}
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
          </div>

          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setStatusFilter("GST")}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === "GST"
                ? "bg-white text-[#17312d] shadow-sm border border-gray-200"
                : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              GST
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <input
              type="text"
              placeholder="Search by No., Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 h-8 w-72 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#dfc797]"
            />
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 sm:mt-0 mt-5 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
        >
          Add New GST
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <GSTForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingGST={editingGST}
        />
      )}

      {/* GST Records Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              {statusFilter === "GST" ? (
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statusFilter === "GST" ? (
                gstTabRecordsToShow.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {shouldClearGSTTab
                        ? "GST data is cleared after the 20th of the month."
                        : "No GST records found. Click “Add New GST” to get started."}
                    </td>
                  </tr>
                ) : (
                  [...gstTabRecordsToShow]
                    .sort((a, b) => {
                      const numA = parseInt(a.number_series?.replace(/\D/g, "")) || 0;
                      const numB = parseInt(b.number_series?.replace(/\D/g, "")) || 0;
                      return numA - numB;
                    })
                    .map((gst, index) => {
                      const rowBgClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                      return (
                        <tr key={gst.id} className={rowBgClass}>
                          <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">{gst.number_series}</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-700">{gst.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <a href={`tel:${gst.phone_no}`} className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium">
                              {gst.phone_no}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDisplayText(gst.company_name, "-")}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyValue(gst.user_id, "User ID");
                              }}
                              className="font-medium text-gray-900 hover:text-blue-600 underline-offset-2 hover:underline text-left"
                            >
                              {gst.user_id || "-"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyValue(gst.password, "Password");
                              }}
                              className="font-medium text-gray-900 hover:text-blue-600 underline-offset-2 hover:underline text-left"
                            >
                              {gst.password || "-"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              {!isGSTR1Completed(gst) && (
                                <button
                                  onClick={() => handleTaskComplete(gst.id, 'GSTR-1')}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors border border-blue-300"
                                >
                                  GSTR-1
                                </button>
                              )}
                              {!isGSTR3BCompleted(gst) && (
                                <button
                                  onClick={() => handleTaskComplete(gst.id, 'GSTR-3B')}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium transition-colors border border-green-300"
                                >
                                  GSTR-3B
                                </button>
                              )}

                              {(isGSTR1Completed(gst) && isGSTR3BCompleted(gst)) && (
                                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded font-medium">
                                  Complete
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )
              ) : (
                filteredGSTRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No GST records found. Click “Add New GST” to get started.
                    </td>
                  </tr>
                ) : (
                  [...filteredGSTRecords]
                    .sort((a, b) => {
                      const numA = parseInt(a.number_series?.replace(/\D/g, "")) || 0;
                      const numB = parseInt(b.number_series?.replace(/\D/g, "")) || 0;
                      return numA - numB;
                    })
                    .map((gst, index) => {
                      const rowBgClass = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                      const hasTags = statusFilter === "ALL" && isTaskWindowOpen() && (isGSTR1Completed(gst) || isGSTR3BCompleted(gst));
                      return (
                        <React.Fragment key={gst.id}>
                          <tr
                            className={`cursor-pointer transition-colors ${rowBgClass} ${hasTags && expandedGST !== gst.id ? 'border-b-0' : ''}`}
                            onClick={() => toggleGSTDetails(gst.id)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">{gst.number_series}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-700">{formatDisplayText(gst.name, "-")}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <a
                                href={`tel:${gst.phone_no}`}
                                className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {gst.phone_no}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDisplayText(gst.company_name, "-")}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyValue(gst.user_id, "User ID");
                                }}
                                className="font-medium text-gray-900 hover:text-blue-600 underline-offset-2 hover:underline text-left"
                              >
                                {gst.user_id || "-"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyValue(gst.password, "Password");
                                }}
                                className="font-medium text-gray-900 hover:text-blue-600 underline-offset-2 hover:underline text-left"
                              >
                                {gst.password || "-"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(gst);
                                  }}
                                  className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(gst.id);
                                  }}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {gst.note && (
                            <tr className={`transition-colors ${rowBgClass}`}>
                              <td colSpan="4" className="px-4 py-2 text-sm">
                                <span className="font-bold text-gray-900">Note: </span>
                                <span className="font-semibold text-gray-800 whitespace-pre-wrap">{formatDisplayText(gst.note, "-")}</span>
                              </td>
                            </tr>
                          )}
                          {hasTags && (
                            <tr
                              className={`cursor-pointer transition-colors ${rowBgClass}`}
                              onClick={() => toggleGSTDetails(gst.id)}
                            >
                              <td colSpan="7" className="px-4 pb-3 pt-0 text-sm">
                                <div className="flex gap-2 items-center">
                                  <span className="font-bold text-gray-900">GST Complete: </span>
                                  {isGSTR1Completed(gst) && (
                                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap flex items-center gap-1">
                                      GSTR-1
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </span>
                                  )}
                                  {isGSTR3BCompleted(gst) && (
                                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap flex items-center gap-1">
                                      GSTR-3B
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {expandedGST === gst.id && (
                            <tr className="animate-in slide-in-from-top-1 duration-300">
                              <td colSpan="7" className="px-0 py-0">
                                <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Personal Information */}
                                    <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Name</p>
                                          <p className="font-medium text-gray-900">{formatDisplayText(gst.name, "-")}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Phone</p>
                                          <p className="font-medium text-gray-900">{gst.phone_no}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Email ID</p>
                                          <p className="font-medium text-gray-900">{gst.email_id || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">PAN Card</p>
                                          <p className="font-medium text-gray-900">{gst.pan_card_no ? gst.pan_card_no.toUpperCase() : "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Password</p>
                                          <p className="font-medium text-gray-900">{gst.password || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Company Name</p>
                                          <p className="font-medium text-gray-900">{formatDisplayText(gst.company_name, "-")}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* GST Information */}
                                    <div className="animate-in fade-in-50 duration-500 delay-200">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">GST Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">GST Number</p>
                                          <p className="font-medium text-gray-900">{gst.gst_no || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Subject</p>
                                          <span
                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${gst.subject === "PROPERTY"
                                              ? "bg-blue-100 text-blue-800"
                                              : gst.subject === "PARTNERSHIP"
                                                ? "bg-green-100 text-green-800"
                                                : gst.subject === "BUSINESS"
                                                  ? "bg-purple-100 text-purple-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                          >
                                            {gst.subject || "N/A"}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Assessment Years</p>
                                          <p className="font-medium text-gray-900">
                                            {gst.assessment_year
                                              ? (() => {
                                                try {
                                                  const years = typeof gst.assessment_year === "string"
                                                    ? JSON.parse(gst.assessment_year)
                                                    : gst.assessment_year;

                                                  return Array.isArray(years)
                                                    ? years.join(", ")
                                                    : years;
                                                } catch {
                                                  return gst.assessment_year;
                                                }
                                              })()
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">GST Filing Frequency</p>
                                          <p className="font-medium text-sm  text-gray-900">{gst.gst_filing_frequency || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">GST Filing Date</p>
                                          <p className="font-medium text-sm text-gray-900">{formatDateTime(gst.gst_filing_date)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Reference Information */}
                                    <div className="animate-in fade-in-50 duration-500 delay-300">
                                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference Information</h4>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">Reference Name</p>
                                          <p className="font-medium text-gray-900">{gst.reference_name || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Reference Phone</p>
                                          <p className="font-medium text-gray-900">{gst.reference_phone || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">User ID</p>
                                          <p className="font-medium text-gray-900">{gst.user_id || "-"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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
