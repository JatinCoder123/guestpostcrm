import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Header from "./Header";

const PromptExplorer = () => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { crmEndpoint } = useSelector((state) => state.user);
  const { state } = useLocation();
  const navigateTo = useNavigate();

  const isValid = systemPrompt.trim() && userPrompt.trim();

  const handleSubmit = async (sysOverride, userOverride) => {
    const sys = sysOverride ?? systemPrompt;
    const usr = userOverride ?? userPrompt;

    if (!sys.trim() || !usr.trim()) return;

    try {
      setLoading(true);
      setResponse("");

      const res = await axios.post(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=prompt_explorer`,
        {
          system_prompt: sys,
          user_prompt: usr,
        },
      );

      setResponse(res?.data || "No response received");
    } catch (err) {
      console.error(err);
      setResponse("❌ Error fetching response");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill and auto-run when navigated from Debug
  useEffect(() => {
    if (state?.system && state?.user) {
      setSystemPrompt(state.system);
      setUserPrompt(state.user);
      handleSubmit(state.system, state.user);
    }
  }, []);

  return (
    <div className="h-full w-full bg-gray-50 flex justify-center p-6">
      <div className="w-full space-y-5">
        <Header text="Prompt Explorer" />
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Prompt Explorer
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
          {/* System Prompt */}
          <div>
            <label className="text-xs font-semibold text-gray-600">
              SYSTEM PROMPT
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define AI behavior..."
              rows={3}
              className="mt-1 w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* User Prompt */}
          <div>
            <label className="text-xs font-semibold text-gray-600">
              USER PROMPT
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ask something..."
              rows={3}
              className="mt-1 w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>

          {/* Submit */}
          {isValid && (
            <div className="flex justify-end">
              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Running..." : "Run Prompt"}
              </button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              RESPONSE
            </div>
            <div className="text-sm text-gray-400 animate-pulse">
              Running prompt...
            </div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              RESPONSE
            </div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {typeof response === "object"
                ? JSON.stringify(response, null, 2)
                : response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptExplorer;
