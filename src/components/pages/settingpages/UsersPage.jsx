import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../../../store/constants";
import { m } from "framer-motion";
import { Edit3 } from "lucide-react";
import { useState } from "react";

import SkeletonGrid from "../../SkeletonGrid";
import EditModal from "../../EditModal";
import Loading from "../../Loading";
import Header from "./Header";
import ErrorBox from "./ErrorBox";

export function UsersPage() {
  const [editItem, setEditItem] = useState(null);

  const { loading, data, error, refetch } = useModule({
    url: `https://crm.outrightsystems.org/index.php?entryPoint=get_gpc_users&email=quietfluence@gmail.com`,
    method: "POST",
    body: {
      module: "outr_gpc_users",
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  // Normalize API data response
  const users = data?.data;
  return (
    <div className="p-8">
      {/* Header */}
      <Header text={"User Manager"} />

      {/* Loading */}
      {loading && (
        <div className="mt-10">
          <Loading text={"Users"} />
        </div>
      )}

      {/* Error Component */}
      {error && <ErrorBox message={error.message} onRetry={refetch} />}

      {/* Empty State */}
      {!loading && !error && users?.length == 0 && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No users found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add new users from your backend or configuration panel.
          </p>
        </div>
      )}

      {/* Data Cards */}
      {users?.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((item) => (
            <div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 
              p-5 flex flex-col justify-between group transition-all"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {console.log(item.name)}
                  {item.name}
                </h2>

                <p className="text-gray-600 mt-2 text-sm">
                  {console.log(item.email)}
                  {item.email || "No Email"}
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setEditItem(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                  rounded-xl shadow-sm hover:bg-blue-700 transition"
                >
                  <Edit3 size={18} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditModal item={editItem} onClose={() => setEditItem(null)} />
    </div>
  );
}
