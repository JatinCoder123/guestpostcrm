import { Link } from "react-router-dom";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../../../store/constants";
import { m, AnimatePresence } from "framer-motion";
import { Edit3, Undo2, X } from "lucide-react";
import { useState } from "react";
import SkeletonGrid from "../../SkeletonGrid"; // <== Import Skeleton
import EditModal from "../../EditModal";
import Loading from "../../Loading";
import Header from "./Header";

export default function WebsitesPage() {
  const [editItem, setEditItem] = useState(null);

  const { loading, data, error, refetch } = useModule({
    url: `${MODULE_URL}&action_type=get_data`,
    method: "POST",
    body: {
      module: "outr_Website_manage",
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <Header text={"Website Manager"} />
      {/* Loading Skeleton */}
      {loading && <Loading text={"Websites"} />}

      {/* Error Component */}
      {error && <ErrorBar message={error.message} onRetry={refetch} />}

      {/* Empty State */}
      {!loading && !error && (
        <div className="mt-6 text-center p-10 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-600 text-lg">No Webistes found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add new items from your backend or configuration panel.
          </p>
        </div>
      )}

      {/* Data Cards */}
      {data?.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <m.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 
                        p-5 flex flex-col justify-between group transition-all"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {item.name}
                </h2>

                <div className="mt-3 flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    Motive: {item.motive}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                    Type: {item.type}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-700 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {item.description}
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
            </m.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditModal item={editItem} onClose={() => setEditItem(null)} />
    </div>
  );
}
