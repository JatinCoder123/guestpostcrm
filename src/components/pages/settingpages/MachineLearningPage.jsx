import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

import Header from "./Header";
import Loading from "../../Loading";
import ErrorBox from "./ErrorBox";
import EditModal from "./EditModal";

export function MachineLearningPage() {
  const { crmEndpoint } = useSelector((state) => state.user);

  const [stages, setStages] = useState({});
  const [activeStage, setActiveStage] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editItem, setEditItem] = useState(null);

  // ✅ Fetch all stages
  const fetchStages = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=machine_learning&stages=1`,
      );
      const data = await res.json();

      setStages(data);

      // ✅ set first stage as default
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        setActiveStage(firstKey);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch data based on stage
  const fetchStageData = async (stageKey) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${crmEndpoint.split("?")[0]}?entryPoint=fetch_gpc&type=machine_learning&stage_type=${stageKey}`,
      );
      const data = await res.json();

      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchStages();
  }, []);

  // fetch data when stage changes
  useEffect(() => {
    if (activeStage) {
      fetchStageData(activeStage);
    }
  }, [activeStage]);

  return (
    <div className="p-8">
      <Header text={"Machine Learning Manager"} />

      {/* ✅ Stage Buttons */}
      <div className="flex flex-wrap gap-3 mt-6">
        {Object.entries(stages).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveStage(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${
                activeStage === key
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <Loading text="Machine Learning" />}

      {/* Error */}
      {error && <ErrorBox message={error.message} />}

      {/* Empty */}
      {!loading && rows.length === 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border rounded-xl">
          No data found for this stage.
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div className="mt-8 overflow-x-auto bg-white shadow-md rounded-2xl border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Motive</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Stage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.motive}</td>
                  <td className="p-4">{item.type}</td>
                  <td className="p-4 max-w-[250px] line-clamp-2">
                    {item.description}
                  </td>
                  <td className="p-4">{item.stage}</td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditItem(item)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg ml-auto"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <EditModal
        item={editItem}
        onClose={() => setEditItem(null)}
        stages={stages}
      />
    </div>
  );
}
