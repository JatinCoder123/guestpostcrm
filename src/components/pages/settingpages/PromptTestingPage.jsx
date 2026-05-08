import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import useModule from "../../../hooks/useModule";
import { ChevronDown, Check, Copy, CheckCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { fetchGpc } from "../../../services/api";
import { FETCH_GPC_X_API_KEY } from "../../../store/constants";

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
                    ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }
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

  const [copied, setCopied] = useState("");

  const responseRef = useRef(null);

  const { crmEndpoint } = useSelector((state) => state.user);

  const baseUrl = crmEndpoint.split("?")[0];

  // =========================
  // FETCH STAGES
  // =========================
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const data = await fetchGpc({
          params: {
            type: "machine_learning",
            stage_type: 1,
          },
        });

        setStages(data);
      } catch (err) {
        console.error("Failed to fetch stages:", err);
      }
    };

    fetchStages();
  }, [baseUrl]);

  // =========================
  // FETCH PROMPTS
  // =========================
  useEffect(() => {
    if (!formData.stage) {
      setStagePrompts([]);
      return;
    }

    const fetchStagePrompts = async () => {
      try {
        setStagePromptsLoading(true);

        const data = await fetchGpc({
          params: {
            type: "machine_learning",
            stage_type: formData.stage,
          },
        });

        const rows = Array.isArray(data) ? data : [];

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

    setFormData((prev) => ({
      ...prev,
      prompt: "",
    }));
  }, [formData.stage, baseUrl]);

  // =========================
  // API
  // =========================
  const {
    loading: responseLoading,
    data: response,
    error: responseError,
    refetch,
  } = useModule({
    url: `${crmEndpoint}&type=prompt_testing`,
    method: "POST",
    name: "PROMPT TEST RESULT",
    body: {
      body: formData.body,
      prompt: formData.prompt,
      thread_size: formData.thread_size,
      email: formData.email,
    },
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": FETCH_GPC_X_API_KEY,
    },
    enabled: false,
  });

  // =========================
  // HELPERS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    refetch();
  };

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

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    if (response && responseRef.current && !responseLoading) {
      responseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [response, responseLoading]);

  // =========================
  // PARSE RESPONSE
  // =========================
  const parsedResponse = useMemo(() => {
    if (!response) return null;

    try {
      // if API already returns object
      if (typeof response === "object") {
        return response;
      }

      // if stringified json
      if (typeof response === "string") {
        return JSON.parse(response);
      }

      return null;
    } catch (err) {
      console.error("JSON parse error:", err);
      return null;
    }
  }, [response]);

  // =========================
  // EXTRACT DATA
  // =========================
  const promptText = parsedResponse?.prompt || "";

  const responseData = parsedResponse?.response || parsedResponse?.data || {};

  const summary =
    responseData?.summary || parsedResponse?.summary || "No summary available";

  const reply = responseData?.reply || parsedResponse?.reply || "";

  // =========================
  // COPY FUNCTION
  // =========================
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header text="Prompt Testing" />

      <div className="mx-auto px-6 py-10 space-y-10">
        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Test Prompt Output
          </h2>

          <div className="space-y-6">
            {/* STAGE */}
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
                        handleChange({
                          target: {
                            name: "stage",
                            value: key,
                          },
                        })
                      }
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition border
                        ${
                          formData.stage === key
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

            {/* PROMPT */}
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
                  handleChange({
                    target: {
                      name: "prompt",
                      value,
                    },
                  })
                }
                options={stagePrompts}
              />
            </div>

            {/* THREAD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Thread Size
              </label>

              <CustomDropdown
                value={formData.thread_size}
                placeholder="Select Thread Size"
                onChange={(value) =>
                  handleChange({
                    target: {
                      name: "thread_size",
                      value,
                    },
                  })
                }
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "5", label: "5" },
                  { value: "all", label: "All" },
                ]}
              />
            </div>

            {/* BODY */}
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
                className={`
                  w-full rounded-xl border border-slate-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                  ${
                    isEmailEntered
                      ? "opacity-50 cursor-not-allowed bg-slate-50"
                      : ""
                  }
                `}
              />
            </div>

            {/* EMAIL */}
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
                className="
                  w-full rounded-xl border border-slate-300 px-4 py-3
                  focus:outline-none focus:ring-2 focus:ring-emerald-500
                "
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="
                  px-6 py-2.5 rounded-xl border border-slate-300
                  text-slate-700 font-semibold hover:bg-slate-100 transition
                "
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="
                  px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                  text-white font-semibold shadow-lg hover:opacity-90 transition
                "
              >
                {responseLoading ? "Testing..." : "Test Prompt"}
              </button>
            </div>
          </div>
        </div>
        {/* ========================= */}
        {/* RESPONSE */}
        {/* ========================= */}
        {parsedResponse && !responseError && (
          <div
            ref={responseRef}
            className="
              bg-white border border-slate-200
              rounded-3xl shadow-xl p-8 space-y-8
            "
          >
            <h3 className="text-2xl font-bold text-slate-900">
              Prompt Test Result
            </h3>

            {/* SUMMARY */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b">
                <h4 className="font-semibold text-slate-800">Summary</h4>

                <button
                  onClick={() => copyToClipboard(summary, "summary")}
                  className="
                    flex items-center gap-2 text-sm font-medium
                    text-slate-600 hover:text-indigo-600 transition
                  "
                >
                  {copied === "summary" ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 text-slate-700 leading-relaxed">
                {summary}
              </div>
            </div>

            {/* REPLY */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b">
                <h4 className="font-semibold text-slate-800">Reply</h4>

                <button
                  onClick={() => copyToClipboard(reply, "reply")}
                  className="
                    flex items-center gap-2 text-sm font-medium
                    text-slate-600 hover:text-indigo-600 transition
                  "
                >
                  {copied === "reply" ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div
                className="
                  p-6 prose prose-sm max-w-none
                  prose-p:leading-relaxed
                  prose-li:my-1
                  prose-hr:my-5
                "
                dangerouslySetInnerHTML={{
                  __html: reply,
                }}
              />
            </div>

            {/* PROMPT */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-5 py-4 border-b">
                <h4 className="font-semibold text-slate-800">Prompt</h4>

                <button
                  onClick={() => copyToClipboard(promptText, "prompt")}
                  className="
                    flex items-center gap-2 text-sm font-medium
                    text-slate-600 hover:text-indigo-600 transition
                  "
                >
                  {copied === "prompt" ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-100 p-5 text-sm whitespace-pre-wrap leading-relaxed text-slate-700 max-h-[500px] overflow-auto">
                {promptText}
              </div>
            </div>
          </div>
        )}
        ~{/* ERROR */}
        {responseError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
            Something went wrong while testing the prompt.
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTestingPage;
