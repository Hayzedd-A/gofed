"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function SignupModal() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    designFirmLocation: "",
    roleDesignFocus: "",
    curiosity: "",
    howHeard: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signupModalOpen, closeSignupModal, openLoginModal } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate all fields are filled
    const requiredFields = Object.keys(formData);
    const emptyFields = requiredFields.filter(field => !formData[field].trim());

    if (emptyFields.length > 0) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/beta-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          designFirmLocation: "",
          roleDesignFocus: "",
          curiosity: "",
          howHeard: ""
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!signupModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2b3a55]">Request Beta Access</h2>
          <button onClick={closeSignupModal} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-5xl">✓</div>
            <h3 className="text-xl font-semibold text-gray-900">Request Submitted!</h3>
            <p className="text-gray-600">
              Thank you for your interest in MOODbrary. We'll review your request and get back to you soon.
            </p>
            <button
              onClick={closeSignupModal}
              className="w-full bg-[#2b3a55] text-white py-2 px-4 rounded-md hover:bg-[#3a4a65] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Design Firm & Location *</label>
              <input
                type="text"
                name="designFirmLocation"
                value={formData.designFirmLocation}
                onChange={handleInputChange}
                placeholder="e.g., Acme Design Studio, New York, NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role or Design Focus *</label>
              <input
                type="text"
                name="roleDesignFocus"
                value={formData.roleDesignFocus}
                onChange={handleInputChange}
                placeholder="e.g., Interior Designer, Material Specialist"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What are you most curious about with MOODbrary? Whether it's AI sourcing, visual curation, or streamlining your process — we'd love to know what drew your eye. *
              </label>
              <textarea
                name="curiosity"
                value={formData.curiosity}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about MOODbrary? *</label>
              <input
                type="text"
                name="howHeard"
                value={formData.howHeard}
                onChange={handleInputChange}
                placeholder="e.g., Social media, colleague, website"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b3a55]"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2b3a55] text-white py-2 px-4 rounded-md hover:bg-[#3a4a65] transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Request Beta Access"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => {
                closeSignupModal()
                openLoginModal()
              }}
              className="text-[#2b3a55] font-medium hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
