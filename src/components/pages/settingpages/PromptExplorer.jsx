import { useState } from "react";
import axios from "axios";

const PromptExplorer = () => {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const isValid = systemPrompt.trim() && userPrompt.trim();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResponse("");

      const res = await axios.post(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=prompt_explorer`,
        {
          system_prompt: systemPrompt,
          user_prompt: userPrompt,
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

  return (
    <div className="p-4 max-w-xl space-y-4">
      {/* System Prompt */}
      <div>
        <label className="text-sm font-medium">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter system prompt..."
          className="w-full mt-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          rows={3}
        />
      </div>

      {/* User Prompt */}
      <div>
        <label className="text-sm font-medium">User Prompt</label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Enter user prompt..."
          className="w-full mt-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          rows={3}
        />
      </div>

      {/* Submit Button (only if both filled) */}
      {isValid && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-1.5 text-sm rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Submit"}
        </button>
      )}

      {/* Response */}
      {response && (
        <div className="p-3 bg-gray-100 rounded-md text-sm whitespace-pre-wrap">
          {typeof response === "object"
            ? JSON.stringify(response, null, 2)
            : response}
        </div>
      )}
    </div>
  );
};

export default PromptExplorer;
