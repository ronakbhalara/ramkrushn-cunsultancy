"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const [formData, setFormData] = useState({
    status_name: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/loan-status");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status_name.trim()) {
      newErrors.status_name = "Status name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const url = editingSetting
        ? `/api/loan-status?id=${editingSetting.id}`
        : "/api/loan-status";
      const method = editingSetting ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingSetting ? "Setting updated successfully!" : "Setting added successfully!"
        );
        resetForm();
        fetchSettings();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      status_name: setting.status_name,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;

    try {
      const response = await fetch(`/api/loan-status?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Setting deleted successfully!");
        fetchSettings();
      } else {
        toast.error(data.message || "Failed to delete setting");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      status_name: "",
    });
    setErrors({});
    setEditingSetting(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-[#1c3430] mb-4">
              {editingSetting ? "Edit Status" : "Add New Status"}
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.status_name}
                  onChange={(e) =>
                    setFormData({ ...formData, status_name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#dfc797] focus:border-transparent text-black ${errors.status_name ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.status_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.status_name}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
                >
                  {editingSetting ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Loan Status */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Loan Status</h2>
              <p className="text-sm text-gray-500">Manage loan statuses</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#dfc797] text-[#17312d] rounded-lg hover:bg-[#f0d9ae] font-semibold transition-colors"
            >
              Add New Status
            </button>
          </div>
          <div className="p-6 max-h-[400px] h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.map((setting, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-[#dfc797] shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {setting.status_name}
                    </h3>
                    <span className="text-xs text-gray-400">#{setting.id}</span>
                  </div>
                  <div className="flex justify-end space-x-1.5">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(setting.id)}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {settings.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No loan status found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
