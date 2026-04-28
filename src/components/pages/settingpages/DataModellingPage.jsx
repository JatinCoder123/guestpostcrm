import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";

const DEFAULT_POST_PAYLOAD = {
  parent_bean: {
    module: "",
    first_name: "John",
    last_name: "Doe",
    email1: "john@example.com",
  },
  child_bean: {
    module: "Contacts",
    first_name: "Jane",
    last_name: "Smith",
    email1: "jane@example.com",
  },
};

const DataModellingPage = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [activeTab, setActiveTab] = useState("get");

  const [getPayload, setGetPayload] = useState({});
  const [getResponse, setGetResponse] = useState("");
  const [getLoading, setGetLoading] = useState(false);

  const [postPayload, setPostPayload] = useState(DEFAULT_POST_PAYLOAD);
  const [postPayloadText, setPostPayloadText] = useState(
    JSON.stringify(DEFAULT_POST_PAYLOAD, null, 2),
  );
  const [postPayloadError, setPostPayloadError] = useState("");
  const [postResponse, setPostResponse] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const { crmEndpoint } = useSelector((s) => s.user);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${crmEndpoint}&type=all_modules`);
        setModules(res.data.data);
        if (res.data.data.length > 0) {
          const first = res.data.data[0].module_name;
          setSelectedModule(first);
          generateGetPayload(first);
          generatePostPayload(first);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (crmEndpoint) fetchModules();
  }, [crmEndpoint]);

  const generateGetPayload = (moduleName) => {
    setGetPayload({
      module: moduleName,
      where: { status: "New" },
      order_by: "date_entered",
      direction: "DESC",
      limit_from: 0,
      limit_to: 50,
    });
  };

  const generatePostPayload = (moduleName) => {
    const next = {
      ...DEFAULT_POST_PAYLOAD,
      parent_bean: { ...DEFAULT_POST_PAYLOAD.parent_bean, module: moduleName },
    };
    setPostPayload(next);
    setPostPayloadText(JSON.stringify(next, null, 2));
    setPostPayloadError("");
  };

  const handleModuleChange = (e) => {
    const moduleName = e.target.value;
    setSelectedModule(moduleName);
    generateGetPayload(moduleName);
    generatePostPayload(moduleName);
  };

  const handleGetRequest = async () => {
    setGetLoading(true);
    try {
      const res = await axios({
        method: "POST",
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        headers: {
          "x-api-key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json",
        },
        data: getPayload,
      });
      setGetResponse(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setGetResponse(err.message);
    } finally {
      setGetLoading(false);
    }
  };

  const handlePostRequest = async () => {
    setPostLoading(true);
    try {
      const isUpdate =
        postPayload?.parent_bean?.id || postPayload?.child_bean?.id;
      const res = await axios({
        method: "POST",
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=post_data`,
        headers: {
          "x-api-key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json",
        },
        data: postPayload,
      });
      setPostResponse(
        JSON.stringify(
          { type: isUpdate ? "UPDATE ✅" : "CREATE 🆕", data: res.data },
          null,
          2,
        ),
      );
    } catch (err) {
      setPostResponse(err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handlePostPayloadChange = (e) => {
    const val = e.target.value;
    setPostPayloadText(val);
    try {
      setPostPayload(JSON.parse(val));
      setPostPayloadError("");
    } catch {
      setPostPayloadError("Invalid JSON");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            API Explorer
          </h1>
          <p className="text-xs text-black-400 mt-0.5">
            SugarCRM Data Modelling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-black-400 font-bold uppercase tracking-widest">
            Module
          </span>
          <select
            value={selectedModule}
            onChange={handleModuleChange}
            className="text-sm bg-white border border-black-200 rounded-lg px-3 py-2 text-black-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 min-w-[200px]"
          >
            {modules.map((mod, i) => (
              <option key={i} value={mod.module_name}>
                {mod.module_label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {[
          { key: "get", label: "GET Records", dot: "bg-emerald-400" },
          { key: "post", label: "Create / Update", dot: "bg-indigo-400" },
        ].map(({ key, label, dot }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-gray-100 text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {label}
          </button>
        ))}
      </div>

      {/* GET Tab */}
      {activeTab === "get" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: editor */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                  GET
                </span>
                <span className="text-sm text-black-700 font-medium">
                  Request payload
                </span>
              </div>
              <textarea
                rows={10}
                className="w-full bg-black-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 resize-y leading-relaxed"
                value={JSON.stringify(getPayload, null, 2)}
                onChange={(e) => {
                  try {
                    setGetPayload(JSON.parse(e.target.value));
                  } catch {}
                }}
                spellCheck={false}
              />
              <button
                onClick={handleGetRequest}
                disabled={getLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg w-fit transition-colors"
              >
                {getLoading ? (
                  <>
                    <LoadingIcon /> Fetching…
                  </>
                ) : (
                  <>
                    <SendIcon /> Send request
                  </>
                )}
              </button>
            </div>

            {/* Right: response */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">
                  Response
                </span>
                {getResponse && (
                  <button
                    onClick={() => setGetResponse("")}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-600 leading-relaxed min-h-[200px] overflow-y-auto whitespace-pre-wrap flex-1">
                {getResponse || (
                  <span className="text-gray-300">
                    Response will appear here…
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST Tab */}
      {activeTab === "post" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: editor */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  POST
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  Request payload
                </span>
                {postPayloadError && (
                  <span className="ml-auto text-[11px] text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                    {postPayloadError}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-500 border border-indigo-100 font-medium">
                  parent_bean
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-teal-50 text-teal-600 border border-teal-100 font-medium">
                  child_bean
                </span>
              </div>

              <textarea
                rows={14}
                className={`w-full bg-gray-50 border rounded-xl text-sm font-mono text-gray-700 px-4 py-3 outline-none focus:ring-2 resize-y leading-relaxed ${
                  postPayloadError
                    ? "border-red-300 focus:ring-red-100"
                    : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-300"
                }`}
                value={postPayloadText}
                onChange={handlePostPayloadChange}
                spellCheck={false}
              />

              <button
                onClick={handlePostRequest}
                disabled={postLoading || !!postPayloadError}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg w-fit transition-colors"
              >
                {postLoading ? (
                  <>
                    <LoadingIcon /> Sending…
                  </>
                ) : (
                  <>
                    <SendIcon /> Send request
                  </>
                )}
              </button>
            </div>

            {/* Right: response */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">
                  Response
                </span>
                {postResponse && (
                  <button
                    onClick={() => setPostResponse("")}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-600 leading-relaxed min-h-[260px] overflow-y-auto whitespace-pre-wrap flex-1">
                {postResponse || (
                  <span className="text-gray-300">
                    Response will appear here…
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoadingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin">
    <circle
      cx="7"
      cy="7"
      r="5"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeDasharray="20"
      strokeDashoffset="10"
      strokeLinecap="round"
    />
  </svg>
);

export default DataModellingPage;
