import { Link, useLocation } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { useEffect, useState } from "react";

import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";
import EditModal from "./EditModal";
import { useSelector } from "react-redux";


export function MachineLearningPage() {
  const [editItem, setEditItem] = useState(null);
  const { state } = useLocation();
  const { crmEndpoint } = useSelector((state) => state.user);
  const { loading, data, error, setData, refetch, add, update } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "outr_machine_learning",
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "Machine Learning",
  });

  const rows = Array.isArray(data) ? data : [];

  const handleUpdate = (updatedItem) => {
    setData((prev) =>
      prev.map((obj) => (obj.id === updatedItem.id ? updatedItem : obj))
    );
    update({
      url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=post_data`,
      method: "POST",
      body: {
        parent_bean: {
          module: "outr_machine_learning",
          ...updatedItem,
        },
      },
      headers: {
        "x-api-key": `${CREATE_DEAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  };
  useEffect(() => {
    // console.log(state?.promptId);
    if (state?.promptId && data) {
      const item = data.find((item) => item.id === state.promptId);
      if (item) {
        setEditItem(item);
      }
    }
  }, [state?.promptId, data]);
  return (
    <div className="p-8">
      {/* Header */}
      <Header text={"Machine Learning Manager"} />

      {/* Loading */}
      {loading && <Loading text="Machine Learning" />}

      {/* Error */}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">
            No machine learning items found.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Add new items from your backend or configuration panel.
          </p>
        </div>
      )}

      {/* TABLE VIEW */}
      {rows.length > 0 && (
        <div className="mt-8 overflow-x-auto bg-white shadow-md rounded-2xl border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-700 font-semibold">Name</th>
                <th className="p-4 text-gray-700 font-semibold">Motive</th>
                <th className="p-4 text-gray-700 font-semibold">Type</th>
                <th className="p-4 text-gray-700 font-semibold">Description</th>
                <th className="p-4 text-gray-700 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {item.motive}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700 max-w-[300px]">
                    <p className="line-clamp-2 " title={item.description}>
                      {item.description}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditItem(item)}
                      className="flex items-center gap-2 justify-end px-4 py-2 bg-blue-600 text-white 
                      rounded-xl shadow-sm hover:bg-blue-700 transition w-fit ml-auto"
                    >
                      <Edit3 size={18} />
                      Edit
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        item={editItem}
        onClose={() => setEditItem(null)}
        handleUpdate={handleUpdate}
      />
    </div>
  );
}
