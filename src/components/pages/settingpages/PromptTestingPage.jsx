import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import useModule from "../../../hooks/useModule";
import { ChevronDown, Check } from "lucide-react";
import { useSelector } from "react-redux";

export function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  className = "",
  disabled = false,
  maxHeight = "240px",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between
          px-4 py-2.5 rounded-lg border
          bg-white text-sm text-gray-700
          shadow-sm transition
          hover:border-indigo-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border overflow-hidden">
          <div
            style={{ maxHeight }}
            className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No options available
              </div>
            )}
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    px-4 py-2 text-sm transition
                    ${isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const PromptTestingPage = () => {
  const [formData, setFormData] = useState({
    stage: "",
    body: "",
    prompt: "",
    email: "",
    thread_size: "",
  });

  const [stages, setStages] = useState({});
  const [stagePrompts, setStagePrompts] = useState([]);
  const [stagePromptsLoading, setStagePromptsLoading] = useState(false);

  const responseRef = useRef(null);
  const { crmEndpoint } = useSelector((state) => state.user);
  const baseUrl = crmEndpoint.split("?")[0];

  // ✅ Fetch stages on mount
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch(
          `${baseUrl}?entryPoint=fetch_gpc&type=machine_learning&stages=1`,
        );
        const data = await res.json();
        setStages(data);
      } catch (err) {
        console.error("Failed to fetch stages:", err);
      }
    };
    fetchStages();
  }, [baseUrl]);

  // ✅ Fetch prompts for selected stage, extract `name` field
  useEffect(() => {
    if (!formData.stage) {
      setStagePrompts([]);
      return;
    }

    const fetchStagePrompts = async () => {
      try {
        setStagePromptsLoading(true);
        const res = await fetch(
          `${baseUrl}?entryPoint=fetch_gpc&type=machine_learning&stage_type=${formData.stage}`,
        );
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];
        // Extract only items that have a `name` field
        const filtered = rows
          .filter((item) => item?.name)
          .map((item) => ({
            value: item.name,
            label: item.name.replaceAll("_", " "),
          }));
        setStagePrompts(filtered);
      } catch (err) {
        console.error("Failed to fetch stage prompts:", err);
        setStagePrompts([]);
      } finally {
        setStagePromptsLoading(false);
      }
    };

    fetchStagePrompts();
    // Reset prompt selection when stage changes
    setFormData((prev) => ({ ...prev, prompt: "" }));
  }, [formData.stage, baseUrl]);

  const {
    loading: responseLoading,
    data: response,
    error: responseError,
    refetch,
  } = useModule({
    url: `${crmEndpoint}&type=prompt_testing`,
    method: "POST",
    name: "PROMPT TEST RESULT",
    body: formData,
    enabled: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Auto-scroll when response arrives
  useEffect(() => {
    if (response && responseRef.current && !responseLoading) {
      responseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [response, responseLoading]);

  const handleSubmit = () => refetch();

  const handleReset = () => {
    setFormData({
      stage: "",
      body: "",
      prompt: "",
      email: "",
      thread_size: "",
    });
    setStagePrompts([]);
  };

  const isEmailEntered = formData.email.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header text="Prompt Testing" />

      <div className="mx-auto px-6 py-10 space-y-10">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Test Prompt Output
          </h2>

          <div className="space-y-6">
            {/* Stage */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stage
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stages)
                  .filter(([key]) => key)
                  .map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        handleChange({ target: { name: "stage", value: key } })
                      }
                      className={`
            px-4 py-2 rounded-full text-sm font-medium transition border
            ${formData.stage === key
                          ? "bg-indigo-600 text-white border-indigo-600 shadow"
                          : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
                        }
          `}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Prompt — populated from stage_type endpoint */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Prompt
              </label>
              <CustomDropdown
                value={formData.prompt}
                placeholder={
                  !formData.stage
                    ? "Select a stage first"
                    : stagePromptsLoading
                      ? "Loading prompts..."
                      : "Select Prompt"
                }
                disabled={!formData.stage || stagePromptsLoading}
                onChange={(value) =>
                  handleChange({ target: { name: "prompt", value } })
                }
                options={stagePrompts}
              />
            </div>

            {/* Thread Size */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thread Size
              </label>
              <CustomDropdown
                value={formData.thread_size}
                placeholder="Select Thread Size"
                onChange={(value) =>
                  handleChange({ target: { name: "thread_size", value } })
                }
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "5", label: "5" },
                  { value: "all", label: "All" },
                ]}
              />
            </div>

            {/* Email Body — disabled if email is entered */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Body
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                disabled={isEmailEntered}
                placeholder={
                  isEmailEntered
                    ? "Email body disabled when an email address is provided"
                    : "Paste or type the email content here..."
                }
                rows={6}
                className={`w-full rounded-xl border border-slate-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                  ${isEmailEntered ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`}
              />
            </div>

            {/* Email */}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl border border-slate-300
                           text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                           text-white font-semibold shadow-lg hover:opacity-90 transition"
              >
                {responseLoading ? "Testing..." : "Test Prompt"}
              </button>
            </div>
          </div>
        </div>

        {/* Response Box */}
        {response && !responseError && (
          <div
            ref={responseRef}
            className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6"
          >
            <h3 className="text-xl font-bold text-slate-900">
              Prompt Test Result
            </h3>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Response
              </h4>
              <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700">
                {response.response?.toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-600 mb-2">
                Prompt
              </h4>
              <div className="bg-slate-100 rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {response.prompt}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTestingPage;
