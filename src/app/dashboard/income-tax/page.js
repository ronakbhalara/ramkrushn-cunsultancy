"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import IncomeTaxForm from "../../../components/IncomeTaxForm";

export default function IncomeTaxPage() {
  const [incomeTaxRecords, setIncomeTaxRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncomeTax, setEditingIncomeTax] = useState(null);
  const [selectedIncomeTax, setSelectedIncomeTax] = useState(null);
  const [expandedIncomeTax, setExpandedIncomeTax] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    reference_name: "",
    reference_phone: "",
    pan_card_no: "",
    password: "",
    assessment_year: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchIncomeTaxRecords();
  }, []);

  const fetchIncomeTaxRecords = async () => {
    try {
      const response = await fetch("/api/income-tax");
      const data = await response.json();
      if (data.success) {
        setIncomeTaxRecords(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch Income Tax records");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
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
    if (!validateForm()) {
      return;
    }

    try {
      const url = editingIncomeTax
        ? "/api/income-tax"
        : "/api/income-tax";
      const method = editingIncomeTax ? "PUT" : "POST";

      const payload = editingIncomeTax ? { ...formData, id: editingIncomeTax.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingIncomeTax ? "Income Tax record updated successfully!" : "Income Tax record added successfully!"
        );
        resetForm();
        fetchIncomeTaxRecords();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (incomeTax) => {
    setEditingIncomeTax(incomeTax);
    setFormData({
      name: incomeTax.name,
      phone_no: incomeTax.phone_no,
      reference_name: incomeTax.reference_name || "",
      reference_phone: incomeTax.reference_phone || "",
      pan_card_no: incomeTax.pan_card_no || "",
      password: incomeTax.password || "",
      assessment_year: Array.isArray(incomeTax.assessment_year)
        ? incomeTax.assessment_year
        : [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Income Tax record?")) return;

    try {
      const response = await fetch(`/api/income-tax?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Income Tax record deleted successfully!");
        fetchIncomeTaxRecords();
      } else {
        toast.error(data.message || "Failed to delete Income Tax record");
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
      password: "",
      assessment_year: [],
    });
    setErrors({});
    setEditingIncomeTax(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const toggleIncomeTaxDetails = (incomeTaxId) => {
    setExpandedIncomeTax(expandedIncomeTax === incomeTaxId ? null : incomeTaxId);
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
      <div className="flex justify-between items-center mb-6">
        {/* Status Filter */}
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
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
        >
          Add New Income Tax
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <IncomeTaxForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingIncomeTax={editingIncomeTax}
        />
      )}

      {/* Income Tax Records Table */}
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
                  PAN No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incomeTaxRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No Income Tax records found. Click "Add New Income Tax" to get started.
                  </td>
                </tr>
              ) : (
                incomeTaxRecords.map((incomeTax) => (
                  <React.Fragment key={incomeTax.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleIncomeTaxDetails(incomeTax.id)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                        {incomeTax.number_series}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {incomeTax.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {incomeTax.phone_no}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {incomeTax.pan_card_no ? incomeTax.pan_card_no.toUpperCase() : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(incomeTax);
                            }}
                            className="px-3 py-1 text-xs bg-[#dfc797] text-[#17312d] rounded hover:bg-[#f0d9ae] font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(incomeTax.id);
                            }}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedIncomeTax === incomeTax.id && (
                      <tr className="animate-in slide-in-from-top-1 duration-300">
                        <td colSpan="5" className="px-0 py-0">
                          <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Personal Information */}
                              <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{incomeTax.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{incomeTax.phone_no}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">PAN Card</p>
                                    <p className="font-medium text-gray-900">{incomeTax.pan_card_no ? incomeTax.pan_card_no.toUpperCase() : "-"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Assessment Year Information */}
                              <div className="animate-in fade-in-50 duration-500 delay-200">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assessment Information</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Assessment Years</p>
                                    <p className="font-medium text-gray-900">
                                      {incomeTax.assessment_year && incomeTax.assessment_year.length > 0
                                        ? incomeTax.assessment_year.join(", ")
                                        : "-"}
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
                                    <p className="font-medium text-gray-900">{incomeTax.reference_name || "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Reference Phone</p>
                                    <p className="font-medium text-gray-900">{incomeTax.reference_phone || "-"}</p>
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
    </div>
  );
}
