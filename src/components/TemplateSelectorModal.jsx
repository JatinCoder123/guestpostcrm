// TemplateSelectorModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useModule from "../hooks/useModule"; // ← adjust path if needed
import { LoadingChase } from "./Loading"; // ← adjust path if needed

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelect, // called when user clicks "Use This Template"
  crmEndpoint,
}) {
  const navigate = useNavigate();

  const [stages, setStages] = useState({});
  const [stageType, setStageType] = useState("");
  const [sortOption, setSortOption] = useState("newest"); // "newest" | "oldest"
  const [stagesLoading, setStagesLoading] = useState(false);

  // Fetch stages once
  useEffect(() => {
    if (!crmEndpoint || !isOpen) return;
    const fetchStages = async () => {
      setStagesLoading(true);
      try {
        const res = await fetch(
          `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=templates&stages=1`,
        );
        const result = await res.json();
        if (result && typeof result === "object") {
          setStages(result);
          setStageType(Object.keys(result)[0]); // auto-select first
        }
      } catch (err) {
        console.error("Failed to fetch stages", err);
      } finally {
        setStagesLoading(false);
      }
    };
    fetchStages();
  }, [crmEndpoint, isOpen]);

  // Template list per stage
  const {
    loading: templateListLoading,
    data: templateList = [],
    refetch: refetchTemplates,
  } = useModule({
    url: stageType
      ? `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=templates&stage_type=${stageType}`
      : null,
    method: "GET",
    name: "TEMPLATE LIST IN MODAL",
    dependencies: [crmEndpoint, stageType],
    enabled: !!stageType && isOpen,
  });

  // Sorted templates
  const sortedTemplates = useMemo(() => {
    if (!templateList?.length) return [];

    return [...templateList].sort((a, b) => {
      const dateA = new Date(a.date_modified || a.date_entered || 0);
      const dateB = new Date(b.date_modified || b.date_entered || 0);
      return sortOption === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [templateList, sortOption]);

  // Reset sort when stage changes
  useEffect(() => {
    setSortOption("newest");
  }, [stageType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl">
            <div>
              <h3 className="text-2xl font-bold">Choose Email Template</h3>
              <p className="text-indigo-100 text-sm mt-1">
                Select a template to load into composer
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-full transition"
            >
              <X size={28} />
            </button>
          </div>

          {/* Stage Filters + Sort */}
          <div className="p-6 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-4">
            {stagesLoading ? (
              <div className="text-gray-500">Loading stages…</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stages).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setStageType(key)}
                    className={`px-6 py-2.5 rounded-2xl font-medium transition-all ${
                      stageType === key
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                Sort by:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-auto p-8">
            {templateListLoading ? (
              <div className="flex justify-center py-20">
                <LoadingChase />
              </div>
            ) : sortedTemplates?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map((tpl) => (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all group"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition">
                        {tpl.name}
                      </h3>
                      <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                        {tpl.description || "No description available"}
                      </p>
                      <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
                        Updated{" "}
                        <span className="font-mono">
                          {tpl.date_modified || tpl.date_entered}
                        </span>
                      </div>
                    </div>
                    <div className="px-6 pb-6 flex gap-3">
                      <button
                        onClick={() => {
                          onSelect(tpl);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg active:scale-98 transition-all"
                      >
                        <Mail size={19} />
                        Use This Template
                      </button>

                      <button
                        onClick={() => {
                          navigate("/settings/templates", {
                            state: { templateId: tpl.id },
                          });
                          onClose();
                        }}
                        className="p-3 border border-gray-300 hover:bg-gray-100 rounded-xl flex items-center"
                      >
                        <Edit size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-600">
                  No templates in this stage.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-3xl">
            <button
              onClick={() => {
                navigate("/settings/templates");
                onClose();
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
            >
              Manage All Templates →
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 text-gray-600 hover:bg-gray-100 rounded-2xl"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
