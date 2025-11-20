import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../../../store/constants";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";
import { useState } from "react";

import SkeletonGrid from "../../SkeletonGrid";
import EditModal from "../settingpages/EditModal";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";

export function PaypalCredentials() {
  const [editItem, setEditItem] = useState(null);

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: {
      module: "outr_credentials",
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  // Ensure array format
  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="p-8">
      {/* Header */}
      <Header text={"Paypal Credentials"} />

      {/* Loading */}
      {loading && <Loading text="Paypal Credentials" />}

      {/* Error */}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No PayPal credentials found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add new credential items from backend.
          </p>
        </div>
      )}

      {/* TABLE */}
      {rows.length > 0 && (
        <div className="mt-8 overflow-x-auto bg-white shadow-md rounded-2xl border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-gray-700 font-semibold">Name</th>
                <th className="p-4 text-gray-700 font-semibold">Environment</th>
                <th className="p-4 text-gray-700 font-semibold">1st Token</th>
                <th className="p-4 text-gray-700 font-semibold">2nd Token</th>
                <th className="p-4 text-gray-700 font-semibold">Status</th>
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
                  {/* Name */}
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>

                  {/* Environment (endpoint) */}
                  <td className="p-4 text-xs">
                    <div>
                      <p className="text-gray-800 font-medium">Dev</p>
                      <p className="text-gray-600">
                        {item.dev_endpoint || "—"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-800 font-medium">Production</p>
                      <p className="text-gray-600">
                        {item.production_endpoint || "—"}
                      </p>
                    </div>
                  </td>

                  {/* First Token */}
                  <td className="p-4 text-gray-700 max-w-[200px] truncate">
                    {item.dev_first_token || item.production_first_token || "—"}
                  </td>

                  {/* Second Token */}
                  <td className="p-4 text-gray-700 max-w-[200px] truncate">
                    {item.dev_second_token ||
                      item.production_second_token ||
                      "—"}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
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
      <EditModal item={editItem} onClose={() => setEditItem(null)} />
    </div>
  );
}
