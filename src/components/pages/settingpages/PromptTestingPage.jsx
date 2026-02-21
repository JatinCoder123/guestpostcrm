import React, { useState } from "react";
import Header from "./Header";

const PromptTestingPage = () => {
  const [formData, setFormData] = useState({
    stage: "",
    emailBody: "",
    prompt: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Prompt Test Data:", formData);
  };
  const handleReset = () => {
    setFormData({
      stage: "",
      emailBody: "",
      prompt: "",
      email: "",
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header text="Prompt Testing" />

      <div className=" mx-auto px-6 py-10">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Test Prompt Output
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stage */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select stage</option>
                <option value="new">New</option>
                <option value="negotiation">Offer</option>
                <option value="follow_up">Deal</option>
                <option value="follow_up">Order</option>
                <option value="follow_up">Payment</option>
                <option value="follow_up">Reminder</option>
                <option value="follow_up">Defaulter </option>
              </select>
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Body
              </label>
              <textarea
                name="emailBody"
                value={formData.emailBody}
                onChange={handleChange}
                placeholder="Paste or type the email content here..."
                rows={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Prompt
              </label>
              <select
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select prompt</option>
                <option value="polite_reply">Polite Reply</option>
                <option value="negotiation_reply">Negotiation Reply</option>
                <option value="followup_reply">Follow-up Reply</option>
                <option value="rejection_reply">Rejection Reply</option>
              </select>
            </div>

            {/* Email Address (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="reset"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl border border-slate-300
                           text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Reset
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                           text-white font-semibold shadow-lg hover:opacity-90 transition"
              >
                Test Prompt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptTestingPage;
