"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import IncomeTaxForm from "../../../components/IncomeTaxForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function IncomeTaxPage() {
  const [incomeTaxRecords, setIncomeTaxRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncomeTax, setEditingIncomeTax] = useState(null);
  const [selectedIncomeTax, setSelectedIncomeTax] = useState(null);
  const [expandedIncomeTax, setExpandedIncomeTax] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountAmount, setAccountAmount] = useState("");
  const [accountDueDate, setAccountDueDate] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone_no: "",
    reference_name: "",
    reference_phone: "",
    link: "",
    pan_card_no: "",
    password: "",
    assessment_year: [],
    status: "Pending",
    stage: "Doc. Process",
    note: "",
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

  const handleSubmit = async (selectedFiles = []) => {
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Calculate default assessment year
      const getCurrentYear = new Date().getFullYear();
      const currentAssessmentYear = `${getCurrentYear}-${((getCurrentYear + 1) % 100).toString().padStart(2, '0')}`;

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'assessment_year') {
          const years = formData.assessment_year && formData.assessment_year.length > 0
            ? formData.assessment_year
            : [currentAssessmentYear];
          formDataToSend.append(key, JSON.stringify(years));
        } else {
          formDataToSend.append(key, formData[key] || "");
        }
      });

      if (editingIncomeTax) {
        formDataToSend.append("id", editingIncomeTax.id);
      }

      // Append selected files
      selectedFiles.forEach(file => {
        formDataToSend.append("files", file);
      });

      const url = "/api/income-tax";
      const method = editingIncomeTax ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
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
      link: incomeTax.link || "",
      pan_card_no: incomeTax.pan_card_no || "",
      password: incomeTax.password || "",
      assessment_year: Array.isArray(incomeTax.assessment_year)
        ? incomeTax.assessment_year
        : [],
      status: incomeTax.status || "Pending",
      stage: incomeTax.stage || "Doc. Process",
      note: incomeTax.note || "",
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
      link: "",
      pan_card_no: "",
      password: "",
      assessment_year: [],
      status: "Pending",
      stage: "Doc. Process",
      note: "",
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

  const getLinkHref = (value) => {
    if (!value) return null;

    const trimmedValue = String(value).trim();
    if (!trimmedValue) return null;

    if (/^https?:\/\//i.test(trimmedValue) || /^mailto:/i.test(trimmedValue)) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  };

  const handleOpenAccountModal = (incomeTax) => {
    setSelectedIncomeTax(incomeTax);
    setAccountAmount("");
    setAccountDueDate(incomeTax?.due_date || "");
    setShowAccountModal(true);
  };

  const handleSaveAccountReceipt = async () => {
    if (!selectedIncomeTax) return;

    const amountValue = parseFloat(accountAmount);
    if (!amountValue || amountValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setSavingAccount(true);
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number_series: selectedIncomeTax.number_series || "",
          name: selectedIncomeTax.name || "",
          phone_no: selectedIncomeTax.phone_no || "",
          status: "RECEIPT",
          date_time: new Date().toISOString().split("T")[0],
          due_date: accountDueDate || null,
          complete_amount: amountValue,
          reference_name: selectedIncomeTax.reference_name || "",
          reference_phone: selectedIncomeTax.reference_phone || "",
          note: `Income Tax Receipt for ${selectedIncomeTax.name || "customer"}`
          // payment_note: `Receipt amount from Income Tax record`
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Account receipt added successfully");
        setShowAccountModal(false);
        setSelectedIncomeTax(null);
        setAccountAmount("");
        setAccountDueDate("");
      } else {
        toast.error(data.message || "Failed to add account receipt");
      }
    } catch (error) {
      toast.error("Network error while saving account receipt");
    } finally {
      setSavingAccount(false);
    }
  };

  const getStageChipClass = (stage) => {
    const normalizedStage = String(stage || "").trim().toLowerCase();

    switch (normalizedStage) {
      case "complete":
        return "bg-green-100 text-green-800 border border-green-200";
      case "itr process":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "e-verification":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "close":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "document pending":
      case "doc. process":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "in-progress":
        return "bg-cyan-100 text-cyan-800 border border-cyan-200";
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  };

  const getAssessmentYears = (value) => {
    if (!value) return [];

    try {
      const parsedValue = typeof value === "string" ? JSON.parse(value) : value;
      if (Array.isArray(parsedValue)) {
        return parsedValue.filter(Boolean).map((year) => String(year));
      }
      return [String(parsedValue)].filter(Boolean);
    } catch {
      return [String(value)].filter(Boolean);
    }
  };

  const matchesFilters = (record) => {
    if (statusFilter !== "ALL") {
      const recordStage = String(record.stage || "").trim();
      if (recordStage !== statusFilter) return false;
    }

    if (yearFilter !== "ALL") {
      const recordYears = getAssessmentYears(record.assessment_year);
      if (!recordYears.includes(yearFilter)) return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    if (record.number_series && record.number_series.toString().toLowerCase().includes(query)) return true;
    if (record.name && record.name.toLowerCase().includes(query)) return true;
    if (record.phone_no && record.phone_no.toLowerCase().includes(query)) return true;

    return false;
  };

  const availableAssessmentYears = [...new Set(
    incomeTaxRecords.flatMap((record) => getAssessmentYears(record.assessment_year))
  )].sort((a, b) => a.localeCompare(b));

  const exportToExcel = () => {
    try {
      const filteredData = incomeTaxRecords.filter(matchesFilters);

      if (filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }

      const excelData = filteredData.map((record, index) => ({
        "NO.": record.number_series,
        "Name": record.name || "-",
        "Phone": record.phone_no || "-",
        "Status": record.status || "-",
        "Pan No": record.pan_card_no ? record.pan_card_no.toUpperCase() : "-",
        "Password": record.password || "-",
        "Reference Name": record.reference_name || "-",
        "Reference Phone": record.reference_phone || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Income Tax");

      // Set column widths
      const columnWidths = [
        { wch: 8 },  // NO.
        { wch: 20 }, // Name
        { wch: 15 }, // Phone
        { wch: 12 }, // Status
        { wch: 12 }, // Pan No
        { wch: 15 }, // Password
        { wch: 18 }, // Reference Name
        { wch: 18 }, // Reference Phone
      ];
      worksheet["!cols"] = columnWidths;

      const fileName = `Income_Tax_Records_${new Date().toLocaleDateString('en-IN')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel file");
    }
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
      <div className="flex justify-between items-center mb-6 overflow-x-auto pb-2">
        {/* Status Filter */}
        <div className="flex gap-2 whitespace-nowrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 focus:border-[#dfc797] focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="Doc. Process">Doc. Process</option>
            <option value="Itr Process">Itr Process</option>
            <option value="E-Verification">E-Verification</option>
            <option value="Complete">Complete</option>
            <option value="Close">Close</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 focus:border-[#dfc797] focus:outline-none"
          >
            <option value="ALL">All Years</option>
            {availableAssessmentYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors flex items-center gap-2"
          >
            📊 Export to Excel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
          >
            Add New Income Tax
          </button>
        </div>
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

      {showAccountModal && selectedIncomeTax && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#1c3430] mb-4">Account Receipt Amount</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create an account receipt for <span className="font-semibold">{selectedIncomeTax.name}</span>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accountAmount}
                  onChange={(e) => setAccountAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                  placeholder="Enter receipt amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={accountDueDate}
                  onChange={(e) => setAccountDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={handleSaveAccountReceipt}
                disabled={savingAccount}
                className="flex-1 bg-[#dfc797] text-[#17312d] py-2 px-4 rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors disabled:opacity-60"
              >
                {savingAccount ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAccountModal(false);
                  setSelectedIncomeTax(null);
                  setAccountAmount("");
                  setAccountDueDate("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incomeTaxRecords.filter(matchesFilters).length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No Income Tax records found.
                  </td>
                </tr>
              ) : (
                incomeTaxRecords
                  .filter(matchesFilters)
                  .sort((a, b) => {
                    const numA = parseInt(a.number_series?.replace(/\D/g, "")) || 0;
                    const numB = parseInt(b.number_series?.replace(/\D/g, "")) || 0;

                    return numA - numB;
                  })
                  .map((incomeTax) => (
                    <React.Fragment key={incomeTax.id}>
                      <tr
                        className={`hover:bg-gray-50 cursor-pointer ${incomeTax.note && expandedIncomeTax !== incomeTax.id ? 'border-b-0' : ''}`}
                        onClick={() => toggleIncomeTaxDetails(incomeTax.id)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[#1c3430]">
                          {incomeTax.number_series}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatDisplayText(incomeTax.name, "-")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <a
                            href={`tel:${incomeTax.phone_no}`}
                            className="text-[#17312d] hover:text-[#dfc797] hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {incomeTax.phone_no}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {incomeTax.pan_card_no ? incomeTax.pan_card_no.toUpperCase() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStageChipClass(incomeTax.stage)}`}>
                            {incomeTax.stage || "Doc. Process"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {incomeTax.stage === "Complete" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAccountModal(incomeTax);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors"
                              >
                                Account
                              </button>
                            )}
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
                      {incomeTax.note && (
                        <tr
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleIncomeTaxDetails(incomeTax.id)}
                        >
                          <td colSpan="6" className="px-4 pb-3 pt-0 text-sm">
                            <span className="font-bold text-gray-900">Note: </span>
                            <span className="font-semibold text-gray-800 whitespace-pre-wrap">{formatDisplayText(incomeTax.note, "-")}</span>
                          </td>
                        </tr>
                      )}
                      {expandedIncomeTax === incomeTax.id && (
                        <tr className="animate-in slide-in-from-top-1 duration-300">
                          <td colSpan="6" className="px-0 py-0">
                            <div className="bg-gray-50 border-l-4 border-[#dfc797] p-6 shadow-inner transform transition-all duration-300 ease-in-out overflow-hidden">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="animate-in slide-in-from-top-2 duration-500 delay-100">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Name</p>
                                      <p className="font-medium text-gray-900">{formatDisplayText(incomeTax.name, "-")}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Phone</p>
                                      <p className="font-medium text-gray-900">{incomeTax.phone_no}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">PAN Card</p>
                                      <p className="font-medium text-gray-900">{incomeTax.pan_card_no ? incomeTax.pan_card_no.toUpperCase() : "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Password</p>
                                      <p className="font-medium text-gray-900">{incomeTax.password || "-"}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Assessment Year Information */}
                                <div className="animate-in fade-in-50 duration-500 delay-200">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status & Stage</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Status</p>
                                      <p className="font-medium text-gray-900 uppercase">{incomeTax.status || "Pending"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Stage</p>
                                      <p className="font-medium text-gray-900 uppercase">{incomeTax.stage || "Document Pending"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Assessment Years</p>
                                      <p className="font-medium text-gray-900">
                                        {incomeTax.assessment_year
                                          ? (() => {
                                            try {
                                              const years = typeof incomeTax.assessment_year === "string"
                                                ? JSON.parse(incomeTax.assessment_year)
                                                : incomeTax.assessment_year;

                                              return Array.isArray(years)
                                                ? years.join(", ")
                                                : years;
                                            } catch {
                                              return incomeTax.assessment_year;
                                            }
                                          })()
                                          : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Reference & Notes */}
                                <div className="animate-in fade-in-50 duration-500 delay-300">
                                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Reference & Notes</h4>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-gray-500">Reference Name</p>
                                      <p className="font-medium text-gray-900">{formatDisplayText(incomeTax.reference_name, "-")}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Reference Phone</p>
                                      <p className="font-medium text-gray-900">{incomeTax.reference_phone || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Note</p>
                                      <p className="font-medium text-gray-900 whitespace-pre-wrap">{formatDisplayText(incomeTax.note, "-")}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {incomeTax.link && (
                                <div className="mt-3 animate-in fade-in-50 duration-500 delay-400">
                                  <p className="text-sm text-gray-500">Link</p>
                                  <a
                                    href={getLinkHref(incomeTax.link)}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline break-all"
                                  >
                                    {incomeTax.link}
                                  </a>
                                </div>
                              )}
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
