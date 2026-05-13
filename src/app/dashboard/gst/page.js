"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import GSTForm from "../../../components/GSTForm";
import GSTInfoModal from "../../../components/GSTInfoModal";

export default function GSTPage() {
  const [gstRecords, setGstRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGST, setEditingGST] = useState(null);
  const [selectedGST, setSelectedGST] = useState(null);
  const [expandedGST, setExpandedGST] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedGSTForInfo, setSelectedGSTForInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    reference_name: "",
    reference_phone: "",
    pan_card_no: "",
    subject: "",
    gst_no: "",
    user_id: "",
    password: "",
    assessment_year: [],
    gst_filing_date: "",
    gst_filing_frequency: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGSTRecords();
  }, []);

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
      pan_card_no: gst.pan_card_no || "",
      subject: gst.subject || "",
      gst_no: gst.gst_no || "",
      user_id: gst.user_id || "",
      password: gst.password || "",
      assessment_year: Array.isArray(gst.assessment_year)
        ? gst.assessment_year
        : [],
      gst_filing_date: gst.gst_filing_date || "",
      gst_filing_frequency: gst.gst_filing_frequency || "",
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
      reference_name: "",
      reference_phone: "",
      pan_card_no: "",
      subject: "",
      gst_no: "",
      user_id: "",
      password: "",
      assessment_year: [],
      gst_filing_date: "",
      gst_filing_frequency: "",
    });
    setErrors({});
    setEditingGST(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center flex-wrap mb-6">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
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
            onClick={() => setStatusFilter("PROPERTY")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "PROPERTY"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Property
          </button>
          <button
            onClick={() => setStatusFilter("PARTNERSHIP")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "PARTNERSHIP"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Partnership
          </button>
          <button
            onClick={() => setStatusFilter("BUSINESS")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${statusFilter === "BUSINESS"
              ? "bg-[#dfc797] text-[#17312d]"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Business
          </button>
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
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  GST No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PAN No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gstRecords.filter(gst => statusFilter === "ALL" || gst.subject === statusFilter).length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No {statusFilter.toLowerCase()} GST records found. Click "Add New GST" to get started.
                  </td>
                </tr>
              ) : (
                gstRecords
                  .filter(gst => statusFilter === "ALL" || gst.subject === statusFilter)
                  .map((gst) => (
                    <React.Fragment key={gst.id}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleGSTDetails(gst.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                          {gst.number_series}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {gst.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {gst.phone_no}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${gst.subject === "PROPERTY"
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
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {gst.gst_no || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {gst.pan_card_no ? gst.pan_card_no.toUpperCase() : "-"}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInfo(gst);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors flex items-center gap-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                              </svg>
                              Info
                            </button>
                          </div>
                        </td>
                      </tr>
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
                                      <p className="font-medium text-gray-900">{gst.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Phone</p>
                                      <p className="font-medium text-gray-900">{gst.phone_no}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">PAN Card</p>
                                      <p className="font-medium text-gray-900">{gst.pan_card_no ? gst.pan_card_no.toUpperCase() : "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Password</p>
                                      <p className="font-medium text-gray-900">{gst.password || "-"}</p>
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
                                        {gst.assessment_year && gst.assessment_year.length > 0
                                          ? gst.assessment_year.join(", ")
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
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GST Info Modal */}
      <GSTInfoModal
        show={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        gstRecord={selectedGSTForInfo}
        onSubmit={handleInfoSubmit}
      />
    </div>
  );
}
